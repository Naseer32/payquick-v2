# PayQuick V2

Stablecoin payment platform built on Arc.

This repository is the clean V2 foundation. Development is Arc Testnet-only until Mainnet readiness is complete.

## Structure

- `apps/web` - React + Vite frontend
- `apps/api` - Node.js + Express API and payment service
- `packages/shared` - shared constants and types
- `contracts` - smart-contract ABIs and deployment notes
- `database` - PostgreSQL schema and migrations
- `docs` - architecture and development documentation

## Roadmap

1. Foundation
2. Wallet and merchant identity
3. Invoices and checkout
4. On-chain payment submission
5. Payment verification and instant status updates
6. Customers and payment history
7. Notifications and receipts
8. Analytics and merchant tools
9. Security, testing and reliability
10. Mainnet readiness

Do not commit private keys, production credentials, or Mainnet contract addresses.
