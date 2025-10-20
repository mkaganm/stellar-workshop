# Stellar Soroban Message Board

This repository contains a minimal Soroban-backed message board dApp. The frontend is built with Next.js, TypeScript, and Tailwind CSS, while the smart contract uses the Soroban SDK. Docker assets power both the web UI and a Soroban CLI workspace.

Copy `.env.example` to `.env` and provide your deployed contract ID when available.

## Dev run

```bash
docker compose up --build web
```

Open http://localhost:3000, install the Freighter browser extension if prompted, and connect your wallet to continue.

## Soroban usage

```bash
docker compose run --rm soroban bash

# inside the Soroban container:
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

rustup target add wasm32-unknown-unknown
soroban contract build --package message-board

# keys + fund according to StellarDeploy.md guidance
# soroban keys generate deployer
# soroban keys fund deployer --network testnet

CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/message_board.wasm \
  --network testnet \
  --source deployer \
  --json | jq -r '.id')

echo "CONTRACT_ID=$CONTRACT_ID"
```

## Frontend env

Place the deployed contract ID into your environment file and restart the web container:

```bash
NEXT_PUBLIC_CONTRACT_ID=<YOUR_CONTRACT_ID>
docker compose up -d --build web
```

Freighter is a browser extension and must be installed locally—it is not bundled inside any Docker image.
