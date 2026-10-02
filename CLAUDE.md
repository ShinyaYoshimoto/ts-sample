# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of TypeScript sample code, organized as a pnpm workspace monorepo. Each sample explores one topic (Result types, hexagonal architecture, immutable data modeling, Elasticsearch, etc.).

## Repository Layout

- `packages/<name>/` — one sample (topic) per package, published as `@ts-sample/<name>`. Each package has its own `README.md` describing its purpose.
- `packages/shared/<name>/` — shared libraries used by multiple samples (e.g. `elasticsearch-client`, `prisma`, `user-domain`). Consumers import them from `dist/`, so build them first (`pnpm build`; CI does this automatically).
  - `packages/shared/user-domain` — user register (command) / get (query) domain with the unified error spec. Used by `api-styles` and `pubsub`.
- Implementations meant to be compared side by side live in a single package, split by subdirectory:
  - `packages/result-type/src/{un-result,neverthrow,byethrow,fp-ts,effect-ts}` — Result type libraries. Input/output behavior is verified once in `src/contract.test.ts` for all implementations; each `index.test.ts` only covers library-specific API usage.
  - `packages/api-styles/{rest,trpc,graphql-union,connect-rpc}` — the same API (`registerUser` command / `getUser` query) implemented in each API style, to compare how each style is used. Business rules come from `@ts-sample/user-domain`; each style only maps domain results to its own idiom. `contract.test.ts` verifies all styles through `adapters.ts`; per-style tests only cover style-specific behavior. `connect-rpc/generated/` is produced by `pnpm generate` (buf), which also runs on `pnpm install`.
- `packages/pubsub` — Google Cloud Pub/Sub verification: publishes `UserRegistered` after `registerUser` and consumes it with a Pull subscription (idempotent by `eventId`) and a Push subscription (Hono endpoint), with a dead-letter topic. `emulator.test.ts` runs only when `PUBSUB_EMULATOR_HOST` is set (`docker compose up -d pubsub-emulator`).
- Do not use a `sample-` prefix for new packages; the whole repository is samples.

## Commands

Run from the repository root:

- **Install dependencies**: `pnpm install`
- **Build all**: `pnpm build`
- **Test all**: `pnpm test`
- **Single package**: `pnpm --filter ./packages/<path> run test --run` (e.g. `./packages/result-type`)
- **Services** (Postgres / Elasticsearch / Kibana / Pub/Sub emulator): `docker-compose up -d`

`elasticsearch-app` integration tests need Elasticsearch on `http://localhost:9200` (`ELASTICSEARCH_NODE`).

## CI

`.github/workflows/ci.yml` runs build and test on push / pull_request, with Elasticsearch as a service container and the Pub/Sub emulator on the host network (so push subscriptions can reach test servers on `localhost`). It can also be run manually (workflow_dispatch) with a `packages` input to limit the target packages (paths relative to `packages/`, e.g. `result-type shared/elasticsearch-client`).

## Development Notes

- TypeScript with strict mode (`tsconfig.base.json`: ES2020, CommonJS)
- Test framework: Vitest (globals enabled)
- Package manager: pnpm 10.8.0
- Formatter / linter: Biome and Prettier
