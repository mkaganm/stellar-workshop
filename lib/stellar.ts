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
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? '';
const NETWORK_NAME = NETWORK_PASSPHRASE === Networks.TESTNET ? 'TESTNET' : 'PUBLIC';

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

const getAccount = async (publicKey: string): Promise<AccountResponse> => {
  const server = getServer();
  return server.getAccount(publicKey);
};

const buildTransaction = async (account: AccountResponse, method: string, args: any[]): Promise<Transaction> => {
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
  if (typeof window === 'undefined' || !window.freighterApi?.signTransaction) {
    throw new Error('Freighter wallet is required to sign transactions.');
  }

  const server = getServer();
  const prepared = await server.prepareTransaction(tx);
  const { signedTxXdr } = await window.freighterApi.signTransaction(prepared.toXDR(), {
    address: publicKey,
    network: NETWORK_NAME,
  });

  return TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
};

export const fetchMessages = async (publicKey: string) => {
  const account = await getAccount(publicKey);
  const tx = await buildTransaction(account, 'get_messages', []);
  const { server, simulation } = await simulateTransaction(tx);
  const prepared = SorobanRpc.assembleTransaction(tx, simulation, NETWORK_PASSPHRASE);
  const result = await server.simulateTransaction(prepared);

  if (SorobanRpc.Api.isSimulationError(result)) {
    throw new Error('Failed to read messages from contract');
  }

  return scValToNative(result.result.retval) as string[];
};

export const fetchMessageCount = async (publicKey: string) => {
  const account = await getAccount(publicKey);
  const tx = await buildTransaction(account, 'get_message_count', []);
  const { server, simulation } = await simulateTransaction(tx);
  const prepared = SorobanRpc.assembleTransaction(tx, simulation, NETWORK_PASSPHRASE);
  const result = await server.simulateTransaction(prepared);

  if (SorobanRpc.Api.isSimulationError(result)) {
    throw new Error('Failed to read message count');
  }

  return scValToNative(result.result.retval) as number;
};

export const submitMessage = async (publicKey: string, message: string) => {
  const account = await getAccount(publicKey);
  const tx = await buildTransaction(account, 'write_message', [nativeToScVal(message)]);
  const signedTx = await prepareAndSign(tx, publicKey);
  const server = getServer();

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

  return true;
};

export const disconnectWallet = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('stellar-message-board:publicKey');
  }
};
