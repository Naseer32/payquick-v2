# PayQuick V2 Architecture

## Web: `apps/web`
Merchant dashboard, invoices, checkout, customers, payments, notifications, settings, and wallet connection.

## API: `apps/api`
Authentication, merchant accounts, customers, invoices, payments, notifications, database access, blockchain event monitoring, transaction verification, and payment status updates.

Blockchain monitoring belongs in the backend payment service. The browser must not repeatedly rescan the chain for every pending invoice.

## Shared: `packages/shared`
Shared invoice/payment statuses, supported networks, currencies, and validation constants.

## Contracts: `contracts`
Contract ABIs, environment addresses, and deployment notes.

## Database: `database`
Merchants, customers, invoices, payments, payment events, notifications, and audit records.

## Core payment flow
Merchant creates invoice -> API stores invoice -> checkout link -> customer connects wallet -> customer submits USDC payment -> blockchain confirmation -> payment service verifies event -> payment links to invoice -> invoice becomes Paid -> dashboard and checkout update.

## Rule
One blockchain scan should be shared across pending-payment checks. Never perform one full historical scan per invoice or polling request.
