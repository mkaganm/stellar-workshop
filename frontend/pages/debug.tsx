import { useEffect, useState } from 'react';

export default function DebugFreighter() {
  const [detected, setDetected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [methods, setMethods] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const has = Boolean((window as any).freighterApi);
    setDetected(has);
    if (has) {
      try {
        const keys = Object.keys((window as any).freighterApi || {});
        setMethods(keys);
        // Optional: try passive detection of getPublicKey shape
      } catch {}
    }
  }, []);

  const handleGetPublicKey = async () => {
    setError('');
    setPublicKey('');
    try {
      if (typeof window === 'undefined' || !(window as any).freighterApi) {
        throw new Error('Freighter not detected.');
      }
      const api: any = (window as any).freighterApi;

      // Prefer getPublicKey if available (newer API)
      if (typeof api.getPublicKey === 'function') {
        const res = await api.getPublicKey();
        // Some versions return a string, others an object
        const pk = typeof res === 'string' ? res : (res?.publicKey || res?.address);
        if (!pk) throw new Error('No public key returned');
        setPublicKey(pk);
        return;
      }

      // Fallbacks for older API
      if (typeof api.requestAccess === 'function') {
        const { address, error } = await api.requestAccess();
        if (error || !address) throw new Error(error || 'No public key returned');
        setPublicKey(address);
        return;
      }

      if (typeof api.getAddress === 'function') {
        const { address, error } = await api.getAddress();
        if (error || !address) throw new Error(error || 'No public key returned');
        setPublicKey(address);
        return;
      }

      throw new Error('No compatible Freighter method found.');
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        border: '1px solid #1f2937',
        background: '#0b1220',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
      }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Freighter Debug</h1>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>
          Detected: <strong style={{ color: detected ? '#10b981' : '#f87171' }}>{String(detected)}</strong>
        </p>

        {methods.length > 0 && (
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
            Methods: {methods.join(', ')}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={handleGetPublicKey} style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            cursor: 'pointer'
          }}>
            Get Public Key
          </button>
        </div>

        {publicKey && (
          <div style={{
            background: '#0f172a',
            border: '1px solid #1f2937',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            wordBreak: 'break-all',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 12,
          }}>
            Public Key: {publicKey}
          </div>
        )}

        {error && (
          <div style={{ color: '#fca5a5', fontSize: 14 }}>Error: {error}</div>
        )}
      </div>
    </div>
  );
}
