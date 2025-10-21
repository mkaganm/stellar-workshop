import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const STORAGE_KEY = 'stellar-message-board:publicKey';

// Freighter detection with multiple methods
const detectFreighter = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Method 1: Direct window.freighterApi check
  if (window.freighterApi) return true;
  
  // Method 2: Check if Freighter extension injected anything
  const hasFreighterKey = Object.keys(window).some(key => 
    key.toLowerCase().includes('freighter')
  );
  
  return hasFreighterKey;
};

export default function Home() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFreighter, setHasFreighter] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedKey = window.localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      router.replace('/main').catch(console.error);
      return;
    }

    let pollCount = 0;
    const maxPolls = 100; // 10 seconds total
    let detected = false;

    // Check for Freighter immediately and continuously
    const checkFreighter = () => {
      pollCount++;
      const hasApi = detectFreighter();
      
      // Debug logging every second
      if (pollCount === 1 || pollCount % 10 === 0) {
        const debugMsg = `Check ${pollCount}/${maxPolls}: API=${!!window.freighterApi}`;
        console.log(debugMsg);
        setDebugInfo(debugMsg);
      }

      if (hasApi && window.freighterApi) {
        console.log('✅ Freighter API detected!', window.freighterApi);
        setHasFreighter(true);
        detected = true;
        return true;
      }
      return false;
    };

    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => checkFreighter(), 100);
      });
    } else {
      // Initial check after a short delay
      setTimeout(() => checkFreighter(), 100);
    }

    // Poll for Freighter extension
    const pollInterval = setInterval(() => {
      if (detected) {
        clearInterval(pollInterval);
        return;
      }
      
      if (checkFreighter() || pollCount >= maxPolls) {
        clearInterval(pollInterval);
        if (pollCount >= maxPolls && !window.freighterApi) {
          console.warn('❌ Freighter not detected after 10 seconds');
          const allKeys = Object.keys(window).filter(k => 
            k.toLowerCase().includes('stellar') || 
            k.toLowerCase().includes('freighter') ||
            k.toLowerCase().includes('wallet')
          );
          console.log('Available wallet keys:', allKeys);
          setDebugInfo(`Not found. Keys: ${allKeys.join(', ') || 'none'}`);
        }
      }
    }, 100);

    return () => {
      clearInterval(pollInterval);
    };
  }, [router]);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);
      
      // Try Freighter first if available
      if (window.freighterApi?.requestAccess) {
        const { address, error: accessError } = await window.freighterApi.requestAccess();
        if (accessError || !address) {
          throw new Error(accessError ?? 'Unable to retrieve wallet address.');
        }
        window.localStorage.setItem(STORAGE_KEY, address);
        await router.replace('/main');
        return;
      }
      throw new Error('Freighter wallet not detected. Install the browser extension to continue.');
    } catch (err: any) {
      console.error('Wallet connect error', err);
      setError(err?.message || 'Something went wrong while connecting. Please try again.');
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
          <div className="rounded-md border border-blue-500 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
            <p className="font-medium mb-1">🌐 Freighter extension not detected</p>
            <p className="opacity-90">Please install and enable the Freighter Wallet extension to continue.</p>
            <p className="mt-2 text-xs opacity-75">
              Or install Freighter from{' '}
              <a className="underline" href="https://www.freighter.app" target="_blank" rel="noreferrer">
                freighter.app
              </a>
            </p>
            {debugInfo && (
              <div className="mt-2 text-xs opacity-70">
                Debug: {debugInfo}
              </div>
            )}
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
            onClick={() => {
              console.log('Manual check:', {
                hasFreighterApi: !!window.freighterApi,
                freighterApi: window.freighterApi,
                allKeys: Object.keys(window).filter(k => 
                  k.toLowerCase().includes('freighter') || 
                  k.toLowerCase().includes('stellar') ||
                  k.toLowerCase().includes('wallet')
                )
              });
              alert('Check console (F12) for details');
            }}
            className="w-full rounded-lg border border-slate-700 px-4 py-2 text-center text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
          >
            🔍 Debug: Check Console
          </button>
        </div>
      </div>
    </main>
  );
}
