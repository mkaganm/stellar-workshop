import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const STORAGE_KEY = 'stellar-message-board:publicKey';

export default function Home() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFreighter, setHasFreighter] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedKey = window.localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      router.replace('/main').catch(console.error);
    }

    setHasFreighter(Boolean(window.freighterApi));
  }, [router]);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.freighterApi?.requestAccess) {
      setError('Freighter wallet not detected. Install the browser extension to continue.');
      setHasFreighter(false);
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const { address, error: accessError } = await window.freighterApi.requestAccess();
      if (accessError || !address) {
        setError(accessError ?? 'Unable to retrieve wallet address.');
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, address);
      await router.replace('/main');
    } catch (err) {
      console.error('Freighter connect error', err);
      setError('Something went wrong while connecting. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [router]);

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

        <button
          type="button"
          onClick={connectWallet}
          disabled={isConnecting || !hasFreighter}
          className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-center font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
      </div>
    </main>
  );
}
