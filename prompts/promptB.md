You are an expert DevOps & blockchain engineer. Add full **Dockerization** for the existing Next.js + Soroban project you just created. Do NOT change app logic.

## 5) Dockerization
Create:
1) `docker-compose.yml` with two services:
   - `web` → Next.js container (dev by default, port 3000)
   - `soroban` → Rust + Soroban CLI container for build/deploy
2) `frontend/Dockerfile.dev` (Next.js dev + hot reload)
3) `frontend/Dockerfile` (multi-stage production build)
4) `contracts/Dockerfile.soroban` (base: `rust:1.80-slim`, add wasm32 target, `cargo install soroban-cli`)
5) `.env.example` with:
   - `NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443`
   - `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015`
   - `NEXT_PUBLIC_CONTRACT_ID=`
6) `Makefile` with targets:
   - `make up` → `docker compose up --build`
   - `make down` → `docker compose down`
   - `make logs` → `docker compose logs -f web`
   - `make shell-soroban` → `docker compose run --rm soroban bash`
   - `make deploy` → run build+deploy commands (documented) and print CONTRACT_ID

### Constraints & Details
- Bind mounts for live code updates:
  - `./frontend:/app` and keep `/app/node_modules` container-local
  - `./contracts:/contracts` for Soroban
- `web` service envs read from compose or `.env`:
  - `NEXT_PUBLIC_STELLAR_RPC_URL`
  - `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`
  - `NEXT_PUBLIC_CONTRACT_ID`
- Do NOT put Freighter inside containers; it’s a browser extension. The frontend only calls `window.freighterApi` on the client.
- Keep configs HTTPS-ready for prod (brief note in README).

## 6) README
Add a concise README section:
- **Dev run**:
  - `docker compose up --build web`
  - open `http://localhost:3000`
- **Enter Soroban container**:
  - `docker compose run --rm soroban bash`
- **Soroban testnet quickstart** (from StellarDeploy.md):
  - `soroban network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"`
  - `rustup target add wasm32-unknown-unknown`
  - `soroban contract build --package message-board`
  - (keys & fund as needed)
  - `soroban contract deploy --wasm target/wasm32-unknown-unknown/release/message_board.wasm --network testnet --source deployer`
  - echo produced **CONTRACT_ID** and put it into `.env` → `NEXT_PUBLIC_CONTRACT_ID=...`
- **Restart web**:
  - `docker compose up -d --build web`

## 7) Output
- Produce all Docker files, compose, Makefile and README updates.
- Ensure the project runs end-to-end with `docker compose up`.
- Keep it simple. No token/fee logic, no access control.
