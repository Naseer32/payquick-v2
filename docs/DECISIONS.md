# PayQuick V2 Architecture Decisions

## Testnet first

PayQuick V2 is developed on Arc Testnet first.

No Mainnet contract addresses or production credentials should be added during Testnet development.

## Frontend and backend separation

The web application handles presentation, wallet interaction, and user flows.

The API handles application data, business logic, authentication, and payment services.

## Backend payment monitoring

Blockchain payment detection and verification belong to the backend payment service.

The browser must not perform repeated full historical blockchain scans for every pending invoice.

## Shared constants

Values used by both frontend and backend, including network configuration and payment statuses, belong in `packages/shared`.

## Database ownership

Database access belongs to the API.

Frontend components must not connect directly to PostgreSQL.

## Contract boundary

Smart-contract ABIs and deployment information belong in `contracts`.

The frontend and API should reference contract information through controlled configuration.

## Invoice and payment separation

An invoice represents a request for payment.

A payment represents an actual blockchain transaction.

One invoice may have payment attempts or associated payment events.

## Payment verification

A payment should become `paid` only after the payment service verifies the relevant blockchain transaction and event.

The frontend should display the server-confirmed payment state.

## Notifications

Notifications are application data and belong in the backend and database.

The frontend displays notification state.

## Legacy application

The previous single-file PayQuick application is not part of the V2 architecture.

If it needs to be preserved, it should remain outside the V2 application code.

## Architecture changes

Do not restructure the repository for individual features.

A structural change should only be made when there is a genuine architectural reason.
