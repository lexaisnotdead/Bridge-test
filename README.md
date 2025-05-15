# Cross‑Chain Bridge Prototype: Ethereum → Polygon

**Description**

This repository contains a working prototype of a one‑way, trust‑assumed bridge for a single ERC20 token (eSTR → pSTR) between Ethereum Holesky and Polygon Amoy testnets. Users lock native tokens on Ethereum and receive a minted representation on Polygon via a trusted off‑chain relayer.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Relayer](#relayer)
- [Behavior](#behavior)
- [Security & Trust Assumptions](#security-&-trust-assumptions)
- [License](#license)

## Prerequisites

- Node.js >= 16  
- `npm` or `yarn`  
- Hardhat  
- `.env` file with RPC URLs, keys, and API tokens  
- SQLite3 (for inspecting `relayer.db`)

Create a .env in the project root from the example in the **env.example** file

## Relayer
The relayer listens to BridgeDeposit events on Ethereum and calls mint(...) on Polygon:
```bash
npm run start     # or npx ts-node relayer/index.ts
```

## Behavior:
1. Tracks last processed block in **processed_blocks**
2. Queries BridgeDeposit logs
3. Checks/mints nonces and records in **processed_nonces**

## Security & Trust Assumptions
* Nonce-based replay protection on both chains
* AccessControl roles for minting operations
* Relayer is trusted for prototype; in production you’d add:
    * Multi‑sig or threshold signatures
    * Cryptographic proof verification (e.g., Merkle proofs)

* On the Ethereum Holesky testnet, the **eSTR** token contract includes a publicly callable **mint** function that can be accessed by anyone. This is intentional to allow users and reviewers to test the bridge and relayer without needing admin intervention.


## License
This project is licensed under the [MIT License](./LICENSE)