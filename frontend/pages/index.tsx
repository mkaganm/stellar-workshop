import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  connectFreighter,
  disconnectFreighter,
  getStoredPublicKey,
  isFreighterAvailable,
  PUBLIC_KEY_STORAGE_KEY,
} from '@/lib/stellar';

export default function Home() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFreighter, setHasFreighter] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasFreighter(isFreighterAvailable());
      const storedKey = getStoredPublicKey();
      if (storedKey) {
        setPublicKey(storedKey);
        router.replace('/main').catch(console.error);
      }
    }
  }, [router]);

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const address = await connectFreighter();
      setHasFreighter(true);
      setPublicKey(address);
      await router.replace('/main');
    } catch (err) {
      console.error('Freighter connect error', err);
      setHasFreighter(isFreighterAvailable());
      setError(err instanceof Error ? err.message : 'Something went wrong while connecting.');
    } finally {
      setIsConnecting(false);
    }
  }, [router]);

  const disconnectWallet = useCallback(() => {
    disconnectFreighter();
    setPublicKey(null);
    setError(null);
    setHasFreighter(isFreighterAvailable());
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white">Crypto Message Board</h1>
          <p className="text-sm text-slate-400">
            Connect your Freighter wallet to start posting messages on the Stellar testnet.
          </p>
        </div>

        {!hasFreighter && (
          <div className="rounded-md border border-amber-500 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Freighter wallet extension is not detected. Install it from{' '}
            <a className="underline" href="https://www.freighter.app" target="_blank" rel="noreferrer">
              freighter.app
            </a>{' '}
            to continue.
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="space-y-3">
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting || !hasFreighter}
            className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-center font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
          <button
            type="button"
            onClick={disconnectWallet}
            disabled={!publicKey}
            className="w-full rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-rose-500 hover:text-rose-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          >
            Disconnect Wallet
          </button>
        </div>

        <p className="text-center text-xs text-slate-500">
          Stored key: {publicKey ?? 'None'}
        </p>
        <p className="text-center text-xs text-slate-600">
          Local storage key: <code className="font-mono text-slate-400">{PUBLIC_KEY_STORAGE_KEY}</code>
        </p>
      </div>
    </main>
  );
}
