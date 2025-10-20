import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  disconnectWallet,
  fetchMessageCount,
  fetchMessages,
  submitMessage,
} from '@/lib/stellar';

const STORAGE_KEY = 'stellar-message-board:publicKey';

export default function Main() {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedKey = window.localStorage.getItem(STORAGE_KEY);
    if (!storedKey) {
      router.replace('/').catch(console.error);
      return;
    }

    setPublicKey(storedKey);
  }, [router]);

  const loadMessages = useCallback(async () => {
    if (!publicKey) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [allMessages, count] = await Promise.all([
        fetchMessages(publicKey),
        fetchMessageCount(publicKey),
      ]);
      setMessages(allMessages);
      setMessageCount(count);
    } catch (err) {
      console.error('Failed to fetch messages', err);
      setError('Unable to load messages right now.');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!publicKey || !message.trim()) {
        return;
      }

      try {
        setIsPosting(true);
        setError(null);
        await submitMessage(publicKey, message.trim());
        setMessage('');
        await loadMessages();
      } catch (err) {
        console.error('Submit message error', err);
        setError('Failed to post message. Check the console for details.');
      } finally {
        setIsPosting(false);
      }
    },
    [publicKey, message, loadMessages]
  );

  const handleDisconnect = useCallback(async () => {
    disconnectWallet();
    setPublicKey(null);
    await router.replace('/');
  }, [router]);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-white">Message Board</h1>
            <p className="text-sm text-slate-400">Share a note with the Stellar testnet community.</p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="text-xs font-mono text-slate-400">{publicKey ?? 'Loading…'}</p>
            <button
              type="button"
              onClick={handleDisconnect}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-rose-500 hover:text-rose-200"
            >
              Disconnect
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-200" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share something nice with the network…"
              className="h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={isPosting || !message.trim()}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isPosting ? 'Posting…' : 'Post Message'}
            </button>
          </form>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <span className="text-sm text-slate-400">Total: {messageCount}</span>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-slate-400">Loading messages…</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-500">No messages yet. Be the first to post!</p>
            ) : (
              messages.map((item, index) => (
                <article
                  key={`${item}-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200"
                >
                  {item}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
