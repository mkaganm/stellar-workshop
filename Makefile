.PHONY: up down logs shell-soroban deploy

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f web

shell-soroban:
	docker compose run --rm soroban bash

deploy:
	docker compose run --rm soroban bash -lc 'set -euo pipefail; \
	  soroban network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015" || true; \
	  rustup target add wasm32-unknown-unknown; \
	  soroban contract build --package message-board; \
	  CONTRACT_ID=$$(soroban contract deploy --wasm target/wasm32-unknown-unknown/release/message_board.wasm --network testnet --source deployer); \
	  echo "\nDeployed CONTRACT_ID: $$CONTRACT_ID"; \
	  echo "Update .env with NEXT_PUBLIC_CONTRACT_ID=$$CONTRACT_ID";'
