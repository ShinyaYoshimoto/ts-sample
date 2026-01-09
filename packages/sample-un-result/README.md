# sample-un-result

This package demonstrates error handling using **pure TypeScript** without any Result-type libraries. It serves as a baseline comparison to understand the benefits and trade-offs of using Result types.

## Overview

This implementation uses traditional error handling approaches in TypeScript:
- **try-catch blocks** for exception handling
- **Throwing errors** for failure cases
- **Union types** for success/error responses
- **null/undefined** returns (anti-pattern shown for comparison)

## Implementation Features

### 1. Traditional throw-based Errors
```typescript
export function validateInput(input: CreateUserInput): CreateUserInput {
  if (!input.email || input.email.trim() === '') {
    throw { _tag: 'ValidationError', message: 'Email is required' } as ValidationError;
  }
  return input;
}
```

### 2. Try-Catch Error Handling
```typescript
export function registerUser(input: CreateUserInput): 
  { success: true; data: User } | { success: false; error: AppError } {
  try {
    const validatedInput = validateInput(input);
    checkUserExists(validatedInput.email);
    const user = saveUser(createUser(validatedInput));
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as AppError };
  }
}
```

### 3. Null Pattern (Anti-pattern)
```typescript
export function registerUserNullable(input: CreateUserInput): User | null {
  try {
    // ... operations
    return user;
  } catch {
    return null; // Loses all error information!
  }
}
```

## Characteristics

### Pros
- ✅ Native to JavaScript/TypeScript
- ✅ No additional dependencies
- ✅ Familiar to most developers
- ✅ Works with existing ecosystem

### Cons
- ❌ Errors not tracked in type signatures
- ❌ Easy to forget error handling
- ❌ try-catch blocks are verbose
- ❌ Errors can be thrown from anywhere
- ❌ Type narrowing requires manual checks
- ❌ Null pattern loses error information
- ❌ Stack traces can be misleading
- ❌ Difficult to compose operations safely

## Common Problems

### 1. No Compile-Time Error Tracking
```typescript
// Function signature doesn't tell you it can throw
function validateInput(input: CreateUserInput): CreateUserInput {
  throw new Error(); // Surprise!
}

// Caller has no way to know they should handle errors
const result = validateInput(input); // Might crash!
```

### 2. Easy to Forget Error Handling
```typescript
// This compiles fine but will crash if validation fails
const validated = validateInput(input);
const user = saveUser(createUser(validated));
// No reminder to handle errors!
```

### 3. Type Safety Issues
```typescript
try {
  // ...
} catch (error) {
  // error is 'unknown' or 'any'
  // Need manual type guards
  if (error && typeof error === 'object' && '_tag' in error) {
    // Now we can use it
  }
}
```

### 4. Null Pattern Loses Context
```typescript
const user = registerUserNullable(input);
if (user === null) {
  // Why did it fail? Validation? Conflict? Infrastructure?
  // No way to know!
}
```

### 5. Difficult Composition
```typescript
// Can't easily chain operations
try {
  const a = operationA();
  try {
    const b = operationB(a);
    try {
      const c = operationC(b);
      return c;
    } catch (errorC) {
      // Handle C error
    }
  } catch (errorB) {
    // Handle B error
  }
} catch (errorA) {
  // Handle A error
}
```

## Comparison with Result Types

| Aspect | Pure TypeScript | Result Types |
|--------|----------------|--------------|
| Error tracking | ❌ Runtime only | ✅ Compile-time |
| Type safety | ⚠️ Requires guards | ✅ Automatic |
| Composition | ❌ Verbose | ✅ Clean |
| Explicitness | ❌ Hidden throws | ✅ Explicit |
| Learning curve | ✅ Low | ⚠️ Medium |
| Boilerplate | ⚠️ try-catch blocks | ✅ Minimal |

## Usage Examples

### Basic Usage
```typescript
const result = registerUser({ email: "test@example.com", name: "Test" });

if (result.success) {
  console.log("User registered:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### Async Usage
```typescript
const result = await registerUserAsync({ email: "test@example.com", name: "Test" });

if (result.success) {
  console.log("User registered:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### Null Pattern (Not Recommended)
```typescript
const user = registerUserNullable({ email: "test@example.com", name: "Test" });

if (user === null) {
  console.error("Failed to register user"); // But why?
} else {
  console.log("User registered:", user);
}
```

## Why Use Result Types Instead?

After implementing this baseline, the benefits of Result-type libraries become clear:

1. **Type Safety**: Errors are tracked in the type system
2. **Explicitness**: Function signatures show what can fail
3. **Composition**: Easy to chain fallible operations
4. **No Surprises**: Can't forget to handle errors
5. **Better DX**: IDE support for error handling
6. **Functional**: Pure functions without side effects

See the other packages (`sample-byethrow`, `sample-neverthrow`, `sample-effect-ts`, `sample-fp-ts`) for better approaches to error handling.

## Running Tests

```bash
pnpm test
```

## Building

```bash
pnpm build
```
