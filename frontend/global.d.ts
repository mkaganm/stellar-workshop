export {};

declare global {
  interface Window {
    freighterApi?: {
      isConnected?: () => Promise<{ isConnected: boolean }>;
      requestAccess?: () => Promise<{ address?: string; error?: string }>;
      getAddress?: () => Promise<{ address?: string; error?: string }>;
      signTransaction?: (
        xdr: string,
        opts: { network: string; address: string }
      ) => Promise<{ signedTxXdr: string }>;
    };
  }
}
