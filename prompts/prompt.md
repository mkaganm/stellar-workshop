// 🐳 Build a minimal Dockerized message board dApp using Next.js (TypeScript), Tailwind CSS, and Stellar Soroban

Check my pdr_dockerized.md , FreighterWalletDocs.md , StellarDeploy.md File while Coding Process

// ✅ 1. Freighter Wallet
// - Connect button using window.freighterApi
// - Save publicKey to localStorage or state
// - Disconnect clears state
// - Redirect to /main on success
// - Remember: Freighter is a browser extension, not inside the container. Just call window.freighterApi from client-side components.

// ✅ 2. Pages
// - index.tsx: connect page with one button
// - main.tsx: message board UI with:
//   - Input: message text (string)
//   - Button: "Post Message"
//   - Display: list of all messages
//   - Display: total message count
// - Keep styling minimal (Tailwind only)

// ✅ 3. Soroban Contract (Rust)
// - Function: write_message(msg: String) → saves to storage
// - Function: get_messages() → returns Vec<String>
// - Function: get_message_count() → returns u32
// - (Optional) clear_messages() → resets list (admin only)
// - Use `env.storage().persistent()`
// - No external crates or complex logic
// - Add Dockerfile.soroban for contract build/deploy inside container

// ✅ 4. Frontend Integration
// - Call contract functions via Stellar SDK (testnet)
// - Sign tx with Freighter
// - Use try/catch for errors
// - Console log tx results
// - Read network info from environment variables:
//   NEXT_PUBLIC_STELLAR_RPC_URL
//   NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE
//   NEXT_PUBLIC_CONTRACT_ID

// ✅ 5. Dockerization
// - Create docker-compose.yml with services:
//   1) web → Next.js dev/prod container (port 3000)
//   2) soroban → Rust + Soroban CLI container for building and deploying contracts
// - Add Dockerfile.dev (Next.js hot reload)
// - Add Dockerfile (production multi-stage build)
// - Add Dockerfile.soroban (Rust CLI image)
// - Use bind mounts for live code updates (frontend & contracts)
// - Keep .env file outside the containers with network and contract info
// - Add Makefile targets:
//   make up → docker compose up --build
//   make down → docker compose down
//   make shell-soroban → open Soroban container
//   make deploy → run contract build & deploy commands

// ✅ 6. Commands inside container
// - For Soroban build:
//   docker compose run --rm soroban bash
//   soroban contract build --package message-board
// - For testnet deploy:
//   soroban contract deploy --wasm target/wasm32-unknown-unknown/release/message_board.wasm --network testnet --source deployer
// - Export CONTRACT_ID and update .env for frontend:
//   NEXT_PUBLIC_CONTRACT_ID=<your_contract_id>

// ❌ NO: complex logic, fee logic, multiple tokens, wallet inside container
// ✅ YES: simple 2-container setup, clean code, documented flow, runs end-to-end via docker compose up

Wait for my new prompt for deployment part
