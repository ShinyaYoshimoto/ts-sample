# sample-fp-ts

This package demonstrates error handling using **fp-ts**, the standard functional programming library for TypeScript.

## Overview

fp-ts is a comprehensive functional programming library for TypeScript, inspired by Scala and Haskell. It provides:
- `Either<E, A>` type for synchronous error handling
- `TaskEither<E, A>` type for asynchronous error handling
- Extensive functional programming utilities
- Pipe-based composition
- Battle-tested and widely adopted

## Implementation Features

### 1. TaskEither Type
Functions return `TaskEither<Error, Success>` for async operations:
```typescript
function validateInput(input: CreateUserInput): TE.TaskEither<ValidationError, CreateUserInput>
```

### 2. Pipe-based Composition
fp-ts uses the `pipe` function for composition:
```typescript
return pipe(
  validateInput(input),
  TE.chainW((validatedInput) => ...),
  TE.chainW((validatedInput) => ...)
)
```

### 3. Do Notation (Alternative)
fp-ts also supports "do notation" for imperative-style composition:
```typescript
return pipe(
  TE.Do,
  TE.bind('validatedInput', () => validateInput(input)),
  TE.bind('_checkExists', ({ validatedInput }) => checkUserExists(...)),
  ...
)
```

## Key Characteristics

### Pros
- ✅ Mature and battle-tested
- ✅ Comprehensive functional programming toolkit
- ✅ Strong type inference
- ✅ Large community and ecosystem
- ✅ Modular design (tree-shakeable)
- ✅ Well-documented

### Cons
- ❌ Steeper learning curve for FP beginners
- ❌ More verbose than simpler alternatives
- ❌ Requires understanding of FP concepts (Monad, Functor, etc.)
- ❌ Can be overwhelming with many abstractions

## Usage Example

```typescript
const taskEither = registerUser({ email: "test@example.com", name: "Test" });

// Run and handle result
const result = await runTaskEither(taskEither);

if (E.isRight(result)) {
  console.log("User registered:", result.right);
} else {
  console.error("Error:", result.left);
}

// Using fold for pattern matching
const message = E.fold(
  (error) => `Error: ${error.message}`,
  (user) => `Success: ${user.email}`
)(result);
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

- [fp-ts Documentation](https://gcanti.github.io/fp-ts/)
- [fp-ts Learning Resources](https://github.com/gcanti/fp-ts/blob/master/docs/learning-resources.md)
