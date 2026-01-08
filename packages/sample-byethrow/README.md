# sample-byethrow (neverthrow)

This package demonstrates error handling using **neverthrow**, a lightweight Result type library for TypeScript.

## Overview

neverthrow provides a `Result<T, E>` type (similar to Rust's Result) without requiring the use of `throw` statements. It offers:
- Type-safe error handling
- Explicit error types in function signatures
- Simple, lightweight API
- Good async/await integration

## Implementation Features

### 1. Basic Result Pattern
```typescript
async function validateInput(input: CreateUserInput): Promise<Result<CreateUserInput, ValidationError>>
```

### 2. Error Composition
The `registerUser` function demonstrates sequential error handling:
```typescript
export async function registerUser(
  input: CreateUserInput,
): Promise<Result<User, AppError>>
```

### 3. Functional Composition (Alternative)
The `registerUserFunctional` shows neverthrow's functional chaining with `ResultAsync`:
```typescript
return ResultAsync.fromPromise(validateInput(input), ...)
  .andThen((validatedInput) => ...)
  .andThen((validatedInput) => ...)
```

## Key Characteristics

### Pros
- ✅ Very lightweight (~5KB)
- ✅ Simple, intuitive API
- ✅ Great TypeScript type inference
- ✅ Works well with async/await
- ✅ Low learning curve

### Cons
- ❌ Smaller ecosystem compared to effect-ts
- ❌ Less powerful composition tools than fp-ts
- ❌ Manual error type widening needed in some cases

## Usage Example

```typescript
const result = await registerUser({ email: "test@example.com", name: "Test" });

if (result.isOk()) {
  console.log("User registered:", result.value);
} else {
  console.error("Error:", result.error);
}
```

## Running Tests

```bash
pnpm test
```

## Building

```bash
pnpm build
```
