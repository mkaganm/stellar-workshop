<div align="center">

# Stellar Soroban Message Board

Minimal, Dockerized dApp demonstrating a Soroban smart contract with a clean Next.js frontend and Freighter Wallet integration.

<br/>

<strong>Stack</strong>: Next.js · TypeScript · Tailwind CSS · Soroban (Rust) · Docker · Freighter Wallet

</div>

---

## ✨ What is this?

Crypto Message Board is a tiny, production-like example of a Soroban dApp. Users connect their wallet with Freighter and can:

- Read the latest messages from a Soroban smart contract on the Stellar testnet
- Write a new message by signing a transaction in Freighter

It’s deliberately simple so you can focus on end-to-end wiring: wallet → frontend → contract → testnet.

---

## 🧭 Architecture at a glance

- Frontend: Next.js + Tailwind (TypeScript)
   - Pages: `/` (connect), `/main` (message board), `/debug` (Freighter check)
   - Strictly Freighter-only; no other wallet fallback
   - CSP headers are configured to allow the Freighter Chrome extension
- Smart contract: Rust + Soroban SDK
   - Package: `contracts/message-board`
   - Built to `wasm32v1-none` for Soroban CLI 23.x
- Dev tooling: Docker Compose
   - `web`: Next.js dev server (hot reload)
   - `soroban`: Rust + Soroban CLI for build/deploy

---

## ✅ Features

- Freighter-only wallet connect and transaction signing
- Clean, minimal UI with Tailwind CSS
- End-to-end testnet flow: build → deploy → interact
- Dockerized dev experience (no global toolchain required)
- Hardened dev-time CSP that permits the Freighter extension

---

## 🔧 Prerequisites

- Docker Desktop
- Google Chrome (or Chromium-based browser)
- Freighter Wallet extension installed and enabled

---

## ⚙️ Configuration

Environment variables are read from both the project root `.env` and `frontend/.env.local` during development. These are set to Stellar testnet by default:

- `NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443`
- `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015`
- `NEXT_PUBLIC_CONTRACT_ID=<SET_ME_AFTER_DEPLOY>`

After deploying the contract (see below), set `NEXT_PUBLIC_CONTRACT_ID` to your deployed contract ID. In this repository, the current testnet deployment is:

```
NEXT_PUBLIC_CONTRACT_ID=CAMIXDMCIJCGQ2WVV5FK3YRQOZ6ITXRZFQZYK2M52CRUEDH3J2EKKSEK
```

Explorer link: https://stellar.expert/explorer/testnet/contract/CAMIXDMCIJCGQ2WVV5FK3YRQOZ6ITXRZFQZYK2M52CRUEDH3J2EKKSEK

---

## 🚀 Run locally

1) Start the frontend (hot reload):

- `docker compose up --build web`
- Open http://localhost:3000

2) Verify Freighter integration:

- Visit http://localhost:3000/debug
- You should see “Detected: true”; click “Get Public Key” to trigger the Freighter prompt

3) Use the app:

- Go to http://localhost:3000/main
- Read existing messages and post a new one (Freighter will ask you to sign)

You can also use these shortcuts:

- `make up` / `make down` — start/stop services
- `make logs` — tail the web logs
- `make shell-soroban` — open a shell in the Soroban CLI container

---

## 🧪 Deploy the contract to testnet

The repo includes a ready-to-use Soroban toolchain container that compiles and deploys the `message-board` contract to the Stellar testnet.

Quick outline (Windows PowerShell shown; similar on macOS/Linux):

1) Open a shell inside the Soroban container

```
docker compose run --rm soroban bash
```

2) Configure the network and toolchain (first run only)

```
soroban network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"
rustup target add wasm32-unknown-unknown
rustup target add wasm32v1-none
```

3) Create and fund a deployer identity on testnet

```
soroban keys generate deployer
soroban keys address deployer
soroban keys fund deployer --network testnet
```

4) Build and deploy the contract

```
soroban contract build --package message-board
soroban contract deploy --wasm target/wasm32v1-none/release/message_board.wasm --network testnet --source deployer
```

This prints a contract ID (starts with C…). Put that value into `.env` and `frontend/.env.local` as `NEXT_PUBLIC_CONTRACT_ID`. Then restart the frontend:

```
docker compose up -d --build web
```

Tip: There’s a convenience target that runs the deploy steps for you:

```
make deploy
```

> Note: If your environment shell doesn’t expose `soroban` on PATH inside non-interactive sessions, run it via its full path inside the container (`/usr/local/cargo/bin/soroban`).

---

## 🔒 CSP and extension permissions

During development we add a Content-Security-Policy header that permits the Freighter Chrome extension to inject and connect:

- `script-src` and `connect-src` include `chrome-extension:`
- This is configured in `frontend/next.config.js`

If Freighter is not detected on `/debug`:

- Ensure the extension is installed and allowed to run on localhost
- Check your browser’s site permissions
- Verify you’re visiting the page over http://localhost:3000 (not a custom host)

---

## 🧱 Project layout

```
contracts/              # Rust + Soroban smart contract workspace
   message-board/        # Contract package
frontend/               # Next.js app (TypeScript + Tailwind)
   pages/                # /, /main, /debug
docker-compose.yml      # web + soroban services
```

---

## 🧰 Scripts and tooling

- `make up` / `make down` — start/stop services
- `make logs` — tail web logs
- `make shell-soroban` — enter Soroban CLI container
- `make deploy` — build + deploy contract to testnet

---

## 🧩 Troubleshooting

- Freighter not detected
   - Use Chrome and enable the extension on localhost
   - Check `/debug` to confirm detection and public key retrieval
- No Freighter popup on write
   - Make sure you’re actually on `/main` posting a message
   - Ensure `NEXT_PUBLIC_CONTRACT_ID` is set and the contract exists on testnet
- Deploy/build errors
   - Ensure `wasm32v1-none` target is installed
   - Use the provided Soroban container; it includes a compatible toolchain
- Friendbot didn’t fund my account
   - Retry friendbot after a short wait; testnet can be rate-limited

---

## 📜 License

MIT — use this as a starting point for your own Soroban dApps.

---

## 🙋‍♀️ What to explore next

- Add pagination to message reads and optimistic updates to the UI
- Expand the contract with message authors and timestamps
- Deploy behind a reverse proxy with TLS and a production Next.js build
