# sample-byethrow

This package demonstrates error handling using **@praha/byethrow**, a lightweight, tree-shakable Result type library for TypeScript.

## Overview

@praha/byethrow is a modern Result type library that provides:
- Tree-shakable and lightweight design
- Object-based (no classes)
- Consistent API for both sync and async operations
- Simple, readable composition with `Result.pipe`
- Automatic Promise handling

## Implementation Features

### 1. Simple Result Type
```typescript
function validateInput(input: CreateUserInput): Result.Result<CreateUserInput, ValidationError>
```

### 2. Pipe-based Composition
The `registerUser` function demonstrates clean composition:
```typescript
export function registerUser(input: CreateUserInput): Result.Result<User, AppError> {
  return Result.pipe(
    validateInput(input),
    Result.andThrough((validated) => checkUserExists(validated.email)),
    Result.andThen((validated) => saveUser(createUser(validated)))
  );
}
```

### 3. Async Support
byethrow automatically handles async operations:
```typescript
export async function registerUserAsync(input: CreateUserInput): Promise<Result.Result<User, AppError>>
```

## Key Characteristics

### Pros
- ✅ Lightweight and tree-shakable
- ✅ Clean, consistent API
- ✅ Excellent TypeScript type inference
- ✅ Unified sync/async handling
- ✅ Simple composition with `Result.pipe`
- ✅ Object-based (no class inheritance)

### Cons
- ❌ Newer library (smaller community than neverthrow/fp-ts)
- ❌ Less ecosystem integrations

## API Highlights

### Core Functions
- `Result.succeed(value)` - Create a success result
- `Result.fail(error)` - Create a failure result
- `Result.isSuccess(result)` - Check if result is success
- `Result.isFailure(result)` - Check if result is failure

### Composition
- `Result.pipe()` - Chain multiple operations
- `Result.andThen(fn)` - Map and chain (flatMap equivalent)
- `Result.andThrough(fn)` - Execute but discard result (useful for validation)
- `Result.map(fn)` - Transform success value

## Usage Example

```typescript
const result = registerUser({ email: "test@example.com", name: "Test" });

if (Result.isSuccess(result)) {
  console.log("User registered:", result.value);
} else {
  console.error("Error:", result.error);
}
```

## Comparison with neverthrow

Both libraries provide similar functionality, but byethrow offers:
- Tree-shakable design for smaller bundles
- Object-based instead of class-based
- More consistent API naming
- Better async/sync unification

## Running Tests

```bash
pnpm test
```

## Building

```bash
pnpm build
```

## Learn More

- [byethrow GitHub](https://github.com/praha-inc/byethrow)
- [byethrow Documentation](https://praha-inc.github.io/byethrow/)
