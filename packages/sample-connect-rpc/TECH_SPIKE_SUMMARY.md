# Tech Spike Summary: Contract-first Result Pattern with Connect (gRPC)

## Overview
This tech spike explored how to implement a Result pattern using Protocol Buffers' `oneof` construct with Connect-es (gRPC for TypeScript).

## Implementation Summary

### Package Created
- **Name**: `@ts-sample/sample-connect-rpc`
- **Location**: `packages/sample-connect-rpc/`
- **Dependencies**: 
  - `@connectrpc/connect` v1.7.0
  - `@bufbuild/protobuf` v1.10.0
  - `@bufbuild/buf` v1.47.2 (code generation tool)

### Key Files

1. **Protocol Definition** (`proto/user/v1/user.proto`)
   - Defined `User` and `ErrorDetail` messages
   - Defined `RegisterUserResponse` with `oneof result`
   - Defined `UserService` with `RegisterUser` RPC

2. **Generated Code** (`generated/user/v1/`)
   - `user_pb.ts`: TypeScript message classes
   - `user_connect.ts`: Service definition for Connect

3. **Server Implementation** (`src/server/user-service.ts`)
   - Validates user input
   - Returns success or error using case-based Result pattern

4. **Client Implementation** (`src/client/user-client.ts`)
   - Two implementations: switch-case and if-else
   - Demonstrates type-safe error handling

5. **Tests** (`result-pattern.test.ts`)
   - 7 tests covering all scenarios
   - All tests passing ✅

## Key Findings

### 1. Protobuf `oneof` Maps to Discriminated Union

**Protobuf Definition:**
```protobuf
message RegisterUserResponse {
  oneof result {
    User user = 1;
    ErrorDetail error = 2;
  }
}
```

**Generated TypeScript:**
```typescript
export class RegisterUserResponse extends Message<RegisterUserResponse> {
  result: {
    value: User;
    case: "user";
  } | {
    value: ErrorDetail;
    case: "error";
  } | { case: undefined; value?: undefined } = { case: undefined };
}
```

**Key Characteristics:**
- Uses discriminated union with `case` as the discriminator
- TypeScript's type narrowing works automatically
- Each variant has a `value` property containing the actual data
- Includes an `undefined` case when no value is set

### 2. Type Safety Benefits

TypeScript's type system provides excellent type safety:

```typescript
if (response.result.case === 'user') {
  // ✅ TypeScript knows result.value is User
  const userId = response.result.value.id;
  
  // ❌ Compile error: Property 'code' does not exist on type 'User'
  // const code = response.result.value.code;
}

if (response.result.case === 'error') {
  // ✅ TypeScript knows result.value is ErrorDetail
  const errorCode = response.result.value.code;
}
```

### 3. Server Implementation Pattern

```typescript
const response = new RegisterUserResponse();

if (validationFailed) {
  // Return error case
  response.result = {
    case: 'error',
    value: new ErrorDetail({
      code: 'INVALID_EMAIL',
      message: 'Email address is invalid'
    })
  };
} else {
  // Return success case
  response.result = {
    case: 'user',
    value: new User({
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com'
    })
  };
}

return response;
```

### 4. Client Handling Patterns

**Pattern 1: Switch Statement**
```typescript
switch (response.result.case) {
  case 'user':
    return { success: true, userId: response.result.value.id };
  case 'error':
    return { success: false, errorCode: response.result.value.code };
  case undefined:
    return { success: false, errorCode: 'UNKNOWN' };
}
```

**Pattern 2: If-Else**
```typescript
if (response.result.case === 'user') {
  return { success: true, userId: response.result.value.id };
}
if (response.result.case === 'error') {
  return { success: false, errorCode: response.result.value.code };
}
return { success: false, errorCode: 'UNKNOWN' };
```

### 5. gRPC Status vs Message Body Result Pattern

**When to use gRPC Status Codes:**
- Infrastructure/transport errors (connection failure, timeout)
- Authentication/authorization failures
- Rate limiting
- Service unavailable
- These are exceptional conditions outside normal business flow

**When to use Message Body Result Pattern:**
- Business validation errors
- Domain-specific error codes
- Multiple error types requiring detailed information
- Errors that are part of normal business flow
- When you want type-safe, explicit error handling
- When clients need structured error information

**Example Boundary:**
```typescript
// gRPC Status: Infrastructure error (401 Unauthorized)
throw new ConnectError('Not authenticated', Code.UNAUTHENTICATED);

// Message Body Result: Business validation (200 OK with error details)
return new RegisterUserResponse({
  result: {
    case: 'error',
    value: new ErrorDetail({
      code: 'INVALID_EMAIL',
      message: 'Email format is invalid'
    })
  }
});
```

## Advantages of This Pattern

1. **Type Safety**: Compiler enforces exhaustive case handling
2. **Explicit**: All outcomes are visible in the type signature
3. **No Exceptions**: Errors are values, not thrown exceptions
4. **Contract-First**: API defined in .proto files
5. **Language Agnostic**: Works across all gRPC-supported languages
6. **Composable**: Result types can be nested and combined
7. **Self-Documenting**: The schema makes the API contract clear

## Test Results

All 7 tests pass:
- ✅ User registration with valid input
- ✅ Alternative client method works correctly
- ✅ Invalid email handling
- ✅ Empty email handling
- ✅ Empty name handling
- ✅ Whitespace-only name handling
- ✅ TypeScript discriminated union type verification

## Build Verification

- ✅ Package builds successfully with TypeScript
- ✅ No TypeScript compilation errors
- ✅ Code generation works with buf
- ✅ All tests pass
- ✅ No CodeQL security vulnerabilities found

## Recommendations

1. **Use Result Pattern for Business Logic Errors**: When errors are part of the expected business flow and need structured information
2. **Use gRPC Status for Infrastructure Errors**: When errors represent exceptional conditions or infrastructure failures
3. **Leverage Type Safety**: The discriminated union provides excellent compile-time safety
4. **Document Error Codes**: Create an enumeration of all possible error codes in your domain
5. **Consider Multiple Error Types**: `oneof` can include more than two variants for complex scenarios

## Files Created

- `packages/sample-connect-rpc/proto/user/v1/user.proto` - Protocol definition
- `packages/sample-connect-rpc/src/server/user-service.ts` - Server implementation
- `packages/sample-connect-rpc/src/client/user-client.ts` - Client implementation
- `packages/sample-connect-rpc/result-pattern.test.ts` - Comprehensive tests
- `packages/sample-connect-rpc/README.md` - Full documentation
- `packages/sample-connect-rpc/package.json` - Package configuration
- `packages/sample-connect-rpc/buf.yaml` - Buf configuration
- `packages/sample-connect-rpc/buf.gen.yaml` - Code generation config
- `packages/sample-connect-rpc/tsconfig.json` - TypeScript config
- `packages/sample-connect-rpc/vitest.config.ts` - Test config

## Conclusion

The tech spike successfully demonstrates how Protocol Buffers' `oneof` construct provides a type-safe, contract-first approach to implementing the Result pattern in TypeScript with Connect-es. The discriminated union type system in TypeScript perfectly complements the protobuf oneof semantics, providing excellent developer experience and compile-time safety.
