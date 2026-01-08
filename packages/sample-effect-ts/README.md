# sample-effect-ts

This package demonstrates error handling using **Effect**, a powerful functional programming library for TypeScript.

## Overview

Effect provides a comprehensive ecosystem for functional programming in TypeScript. It offers:
- Type-safe error tracking in the type system
- Rich ecosystem with many utilities
- Powerful composition operators
- Built-in support for concurrency, retries, timeouts, etc.
- Service/dependency injection patterns

## Implementation Features

### 1. Tagged Errors
Effect uses class-based tagged errors for better type inference:
```typescript
export class ValidationError {
  readonly _tag = 'ValidationError';
  constructor(readonly message: string) {}
}
```

### 2. Effect Type
Functions return `Effect<Success, Error, Requirements>`:
```typescript
function validateInput(input: CreateUserInput): Effect.Effect<CreateUserInput, ValidationError>
```

### 3. Pipe-based Composition
Effect uses functional pipes for composition:
```typescript
return pipe(
  validateInput(input),
  Effect.flatMap((validatedInput) => ...),
  Effect.flatMap((validatedInput) => ...)
)
```

## Key Characteristics

### Pros
- ✅ Extremely powerful and feature-rich
- ✅ Excellent type inference
- ✅ Large ecosystem of utilities
- ✅ Built-in support for complex patterns (retry, timeout, etc.)
- ✅ Active development and community
- ✅ Service/dependency injection built-in

### Cons
- ❌ Steep learning curve
- ❌ Large bundle size (~100KB+)
- ❌ Requires understanding of functional programming concepts
- ❌ More boilerplate for simple cases

## Usage Example

```typescript
const effect = registerUser({ email: "test@example.com", name: "Test" });

// Option 1: Using helper
const result = await runEffect(effect);
if (result.success) {
  console.log("User registered:", result.value);
} else {
  console.error("Error:", result.error);
}

// Option 2: Using Effect.runPromise directly
try {
  const user = await Effect.runPromise(effect);
  console.log("User registered:", user);
} catch (error) {
  console.error("Error:", error);
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

## Learn More

- [Effect Documentation](https://effect.website/)
- [Effect Examples](https://github.com/Effect-TS/effect/tree/main/packages/effect/examples)
