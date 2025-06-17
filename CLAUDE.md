# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains TypeScript sample code implementing hexagonal architecture patterns based on the book "Clean Architecture with Hexagonal Architecture". The main implementation is located in the `250604/` directory.

## Architecture

The codebase follows hexagonal architecture (ports and adapters pattern) with clear separation between:

- **Domain Layer** (`250604/application/domain/`): Core business logic including entities (Account, Activity, Money) and domain services
- **Application Layer** (`250604/application/port/`): Use cases and interfaces defining inbound and outbound ports
- **Adapter Layer** (`250604/adapter/`): Infrastructure implementations for web controllers and persistence

Key architectural components:
- **Inbound Ports**: Use case interfaces (e.g., `SendMoneyUseCase`, `GetAccountBalanceUseCase`)
- **Outbound Ports**: Repository interfaces (e.g., `LoadAccountPort`, `UpdateAccountStatePort`)
- **Domain Models**: `Account`, `Activity`, `ActivityWindow`, `Money` with business logic encapsulated
- **Services**: Application services implementing use cases (e.g., `SendMoneyService`)

## Commands

Working directory for all commands should be `250604/`:

- **Run tests**: `pnpm test` (uses Vitest)
- **Install dependencies**: `pnpm install`

## Development Notes

- Uses TypeScript with strict mode enabled
- Test framework: Vitest with global test functions enabled
- Package manager: pnpm (version 10.8.0)
- Target: ES2020, CommonJS modules