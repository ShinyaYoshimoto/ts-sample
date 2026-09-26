# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of TypeScript sample code, organized as a pnpm workspace monorepo. Each sample explores one topic (Result types, hexagonal architecture, immutable data modeling, Elasticsearch, etc.).

## Repository Layout

- `packages/<name>/` — one sample (topic) per package, published as `@ts-sample/<name>`. Each package has its own `README.md` describing its purpose.
- `packages/shared/<name>/` — shared libraries used by multiple samples (e.g. `elasticsearch-client`, `prisma`).
- Implementations meant to be compared side by side live in a single package, split by subdirectory:
  - `packages/result-type/src/{un-result,neverthrow,byethrow,fp-ts,effect-ts}` — Result type libraries. Input/output behavior is verified once in `src/contract.test.ts` for all implementations; each `index.test.ts` only covers library-specific API usage.
  - `packages/result-transport/{trpc,graphql-union,connect-rpc}` — passing Result types across API boundaries. `connect-rpc/generated/` is produced by `pnpm generate` (buf), which also runs on `pnpm install`.
- Do not use a `sample-` prefix for new packages; the whole repository is samples.

## Commands

Run from the repository root:

- **Install dependencies**: `pnpm install`
- **Build all**: `pnpm build`
- **Test all**: `pnpm test`
- **Single package**: `pnpm --filter ./packages/<path> run test --run` (e.g. `./packages/result-type`)
- **Services** (Postgres / Elasticsearch / Kibana): `docker-compose up -d`

`elasticsearch-app` integration tests need Elasticsearch on `http://localhost:9200` (`ELASTICSEARCH_NODE`).

## CI

`.github/workflows/ci.yml` runs build and test on push / pull_request, with Elasticsearch as a service container. It can also be run manually (workflow_dispatch) with a `packages` input to limit the target packages (paths relative to `packages/`, e.g. `result-type shared/elasticsearch-client`).

## Development Notes

- TypeScript with strict mode (`tsconfig.base.json`: ES2020, CommonJS)
- Test framework: Vitest (globals enabled)
- Package manager: pnpm 10.8.0
- Formatter / linter: Biome and Prettier
