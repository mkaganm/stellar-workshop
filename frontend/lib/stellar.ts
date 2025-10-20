import {
  BASE_FEE,
  Contract,
  Networks,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import type { AccountResponse } from '@stellar/stellar-sdk/lib/rpc/types';

const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? '';
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;
// CONTRACT_ID is read from public environment variables at build/runtime.
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? '';
const NETWORK_NAME = NETWORK_PASSPHRASE === Networks.TESTNET ? 'TESTNET' : 'PUBLIC';

export const PUBLIC_KEY_STORAGE_KEY = 'stellar-message-board:publicKey';

const ensureBrowser = () => {
  if (typeof window === 'undefined') {
    throw new Error('Freighter wallet is only available in the browser.');
  }
};

const ensureConfig = () => {
  if (!RPC_URL || !CONTRACT_ID) {
    throw new Error('Stellar RPC or contract ID configuration is missing.');
  }
};

const allowHttp = RPC_URL.startsWith('http://');

const getServer = () => {
  ensureConfig();
  return new SorobanRpc.Server(RPC_URL, { allowHttp });
};

const getFreighter = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window.freighterApi;
};

export const isFreighterAvailable = () => Boolean(getFreighter());

export const getStoredPublicKey = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(PUBLIC_KEY_STORAGE_KEY);
};

export const connectFreighter = async (): Promise<string> => {
  ensureBrowser();
  const freighter = getFreighter();

  if (!freighter?.requestAccess) {
    throw new Error('Freighter wallet not detected. Install the extension to continue.');
  }

  const { address, error } = await freighter.requestAccess();

  if (error || !address) {
    throw new Error(error ?? 'Unable to retrieve Freighter public key.');
  }

  window.localStorage.setItem(PUBLIC_KEY_STORAGE_KEY, address);
  console.log('Freighter connected with address', address);
  return address;
};

export const disconnectFreighter = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(PUBLIC_KEY_STORAGE_KEY);
  }
};

const resolvePublicKey = async (): Promise<string> => {
  ensureBrowser();

  const freighter = getFreighter();
  if (freighter?.getAddress) {
    try {
      const { address } = await freighter.getAddress();
      if (address) {
        window.localStorage.setItem(PUBLIC_KEY_STORAGE_KEY, address);
        return address;
      }
    } catch (error) {
      console.log('Freighter getAddress error', error);
    }
  }

  const stored = getStoredPublicKey();
  if (stored) {
    return stored;
  }

  throw new Error('Freighter wallet is not connected.');
};

const getAccount = async (publicKey: string): Promise<AccountResponse> => {
  const server = getServer();
  return server.getAccount(publicKey);
};

const buildTransaction = async (
  account: AccountResponse,
  method: string,
  args: unknown[],
): Promise<Transaction> => {
  const contract = new Contract(CONTRACT_ID);
  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(30)
    .addOperation(contract.call(method, ...args))
    .build();
};

const simulateTransaction = async (tx: Transaction) => {
  const server = getServer();
  const simulation = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${JSON.stringify(simulation.error)}`);
  }
  return { server, simulation } as const;
};

const prepareAndSign = async (tx: Transaction, publicKey: string) => {
  const freighter = getFreighter();
  if (!freighter?.signTransaction) {
    throw new Error('Freighter wallet is required to sign transactions.');
  }

  const server = getServer();
  const prepared = await server.prepareTransaction(tx);
  const { signedTxXdr } = await freighter.signTransaction(prepared.toXDR(), {
    address: publicKey,
    network: NETWORK_NAME,
  });

  return TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
};

export const fetchMessages = async (): Promise<string[]> => {
  const publicKey = await resolvePublicKey();
  const account = await getAccount(publicKey);
  const tx = await buildTransaction(account, 'get_messages', []);
  const { simulation } = await simulateTransaction(tx);

  if (!simulation.result) {
    return [];
  }

  const messages = scValToNative(simulation.result.retval) as string[];
  console.log('Fetched messages', messages);
  return messages;
};

export const fetchMessageCount = async (): Promise<number> => {
  const publicKey = await resolvePublicKey();
  const account = await getAccount(publicKey);
  const tx = await buildTransaction(account, 'get_message_count', []);
  const { simulation } = await simulateTransaction(tx);

  if (!simulation.result) {
    return 0;
  }

  const count = scValToNative(simulation.result.retval) as number;
  console.log('Fetched message count', count);
  return count;
};

export const postMessage = async (text: string) => {
  const publicKey = await resolvePublicKey();
  const account = await getAccount(publicKey);
  const tx = await buildTransaction(account, 'write_message', [nativeToScVal(text)]);
  const { server, simulation } = await simulateTransaction(tx);
  const assembled = SorobanRpc.assembleTransaction(tx, simulation, NETWORK_PASSPHRASE);
  const signedTx = await prepareAndSign(assembled, publicKey);

  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === SorobanRpc.Api.SendTransactionStatus.ERROR) {
    console.error('Soroban sendTransaction error', sendResponse);
    throw new Error('Failed to submit message transaction');
  }

  if (sendResponse.status === SorobanRpc.Api.SendTransactionStatus.PENDING) {
    let getResponse = await server.getTransaction(sendResponse.hash);
    while (getResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      getResponse = await server.getTransaction(sendResponse.hash);
    }

    if (getResponse.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      console.error('Transaction failed', getResponse);
      throw new Error('Message transaction failed');
    }
  }

  console.log('Message transaction submitted', sendResponse.hash);
  return sendResponse.hash;
};
