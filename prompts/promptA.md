You are an expert full-stack blockchain developer. Create the full project structure and code now.

Goal: Build a minimal **message board dApp** using **Next.js (TypeScript)**, **Tailwind CSS**, and **Stellar Soroban**. Keep it simple and production-friendly. Follow my local docs during coding: `pdr_dockerized.md`, `FreighterWalletDocs.md`, `StellarDeploy.md`.

## 1) Freighter Wallet (client-only)
- Connect/disconnect using `window.freighterApi` (guard for SSR: only call on client).
- Save `publicKey` to state and/or localStorage.
- Redirect to `/main` on success.
- If Freighter not found, show an install hint.

## 2) Pages (minimal Tailwind, no extra libs)
- `pages/index.tsx`: single “Connect Wallet” page.
- `pages/main.tsx`: message board UI:
  - Input: message text (string)
  - Button: “Post Message”
  - Display: list of all messages
  - Display: total message count

## 3) Soroban Contract (Rust)
- Create `contracts/message-board/src/lib.rs` using Soroban SDK.
- Functions:
  - `write_message(msg: String)` → save to persistent storage (append).
  - `get_messages()` → `Vec<String>`.
  - `get_message_count()` → `u32`.
  - (optional) `clear_messages()` → admin-only stub ok.
- Use `env.storage().persistent()`.
- No external crates or complex logic.
- Include a minimal unit test.

## 4) Frontend Integration
- Create `lib/stellar.ts` helpers to call Soroban on **testnet** and sign with **Freighter**.
- Read envs:
  - `NEXT_PUBLIC_STELLAR_RPC_URL`
  - `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`
  - `NEXT_PUBLIC_CONTRACT_ID`
- Use try/catch and console.log for results.

## 5) Output
- Generate all necessary files and folders for the app to run locally (without Docker yet).
- Keep code clean, commented, and minimal. No tokens/fees/access control.
