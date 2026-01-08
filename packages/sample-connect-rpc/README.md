# Connect (gRPC) Result Pattern Sample

This package demonstrates Contract-first Result Pattern implementation using Connect (gRPC) and Protocol Buffers.

## Overview

This sample explores how to define a Result structure in Protocol Buffers using `oneof` and how it is represented in generated TypeScript code.

## Key Findings

### 1. Protobuf `oneof` to TypeScript Union Type Mapping

The protobuf `oneof` field is mapped to a **discriminated union type** in TypeScript:

```protobuf
message RegisterUserResponse {
  oneof result {
    User user = 1;
    ErrorDetail error = 2;
  }
}
```

This generates:

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

**Key characteristics:**
- Each variant has a `case` property indicating which type is present
- Each variant has a `value` property containing the actual data
- There's a third variant with `case: undefined` for when no value is set
- TypeScript's type narrowing works automatically based on the `case` property

### 2. Server Implementation

The server uses the `case` property to specify which variant to return:

```typescript
// Success case
response.result = {
  case: 'user',
  value: new User({ id: '123', name: 'John', email: 'john@example.com' })
};

// Error case
response.result = {
  case: 'error',
  value: new ErrorDetail({ code: 'INVALID_EMAIL', message: 'Invalid email' })
};
```

### 3. Client Implementation

The client handles responses using case-based branching:

```typescript
switch (response.result.case) {
  case 'user':
    // TypeScript knows result.value is User
    console.log('User created:', response.result.value.id);
    break;
  
  case 'error':
    // TypeScript knows result.value is ErrorDetail
    console.error('Error:', response.result.value.code);
    break;
  
  case undefined:
    // No result was set
    console.error('No result returned');
    break;
}
```

### 4. gRPC Status vs Message Body Result Pattern

**When to use gRPC Status Codes:**
- Network/transport errors (connection failure, timeout)
- Authentication/authorization errors
- Rate limiting
- Service unavailable

**When to use Message Body Result Pattern:**
- Business logic validation errors
- Domain-specific error codes
- Multiple error types that need detailed information
- When you want type-safe error handling
- When errors are part of the normal flow (not exceptional)

**Example boundaries:**

```typescript
// gRPC Status: Used for transport/infrastructure errors
// HTTP 401 Unauthorized, Code.UNAUTHENTICATED
throw new ConnectError('Not authenticated', Code.UNAUTHENTICATED);

// Message Body Result: Used for business validation
// HTTP 200 OK, but result contains error details
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

## Benefits of This Approach

1. **Type Safety**: TypeScript compiler enforces handling of all cases
2. **No Exceptions**: Errors are values, not thrown exceptions
3. **Contract-First**: API contract is defined in .proto files
4. **Explicit**: All possible outcomes are visible in the type system
5. **Composable**: Result types can be nested and combined
6. **Language Agnostic**: Same pattern works in any language that supports gRPC

## Project Structure

```
sample-connect-rpc/
├── proto/                      # Protocol Buffer definitions
│   └── user/v1/
│       └── user.proto          # User service definition with Result pattern
├── generated/                  # Generated TypeScript code (from buf generate)
│   └── user/v1/
│       ├── user_pb.ts          # Generated message classes
│       └── user_connect.ts     # Generated service definition
├── src/
│   ├── server/
│   │   └── user-service.ts     # Server implementation
│   └── client/
│       └── user-client.ts      # Client implementation
└── result-pattern.test.ts      # Tests demonstrating the pattern
```

## Running the Sample

### Install Dependencies

```bash
pnpm install
```

### Generate TypeScript from Protobuf

```bash
pnpm generate
```

This runs `buf generate` which:
1. Reads `.proto` files from the `proto/` directory
2. Generates TypeScript code using `@bufbuild/protoc-gen-es`
3. Generates Connect service code using `@connectrpc/protoc-gen-connect-es`
4. Outputs to the `generated/` directory

### Run Tests

```bash
pnpm test
```

### Build

```bash
pnpm build
```

## Code Examples

### Defining the Result Pattern in Protobuf

See `proto/user/v1/user.proto`:

```protobuf
syntax = "proto3";

package user.v1;

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}

message ErrorDetail {
  string code = 1;
  string message = 2;
}

message RegisterUserRequest {
  string name = 1;
  string email = 2;
}

message RegisterUserResponse {
  oneof result {
    User user = 1;
    ErrorDetail error = 2;
  }
}

service UserService {
  rpc RegisterUser(RegisterUserRequest) returns (RegisterUserResponse);
}
```

### Server Implementation

See `src/server/user-service.ts` for the complete implementation.

### Client Implementation

See `src/client/user-client.ts` for examples of both switch-case and if-else handling.

## TypeScript Type Safety Examples

The generated types provide excellent type safety:

```typescript
const response = await client.registerUser(request);

// TypeScript knows the structure based on case
if (response.result.case === 'user') {
  // ✅ TypeScript knows result.value is User
  const userId = response.result.value.id;
  const userName = response.result.value.name;
  
  // ❌ TypeScript error: Property 'code' does not exist on type 'User'
  // const code = response.result.value.code;
}

if (response.result.case === 'error') {
  // ✅ TypeScript knows result.value is ErrorDetail
  const errorCode = response.result.value.code;
  const errorMessage = response.result.value.message;
  
  // ❌ TypeScript error: Property 'id' does not exist on type 'ErrorDetail'
  // const id = response.result.value.id;
}
```

## Comparison with Other Patterns

### Traditional Exception-Based Error Handling

```typescript
// Traditional approach (not type-safe)
try {
  const user = await registerUser(name, email);
  console.log('Success:', user.id);
} catch (error) {
  // error is any/unknown, need runtime checks
  console.error('Error:', error);
}
```

### Result Pattern with oneof (This Sample)

```typescript
// Type-safe Result pattern
const response = await client.registerUser(request);
switch (response.result.case) {
  case 'user':
    // ✅ Compiler enforces handling
    console.log('Success:', response.result.value.id);
    break;
  case 'error':
    // ✅ Type-safe error handling
    console.error('Error:', response.result.value.code);
    break;
}
```

## References

- [Connect-ES Documentation](https://connectrpc.com/docs/node/getting-started)
- [Protocol Buffers Oneof](https://protobuf.dev/programming-guides/proto3/#oneof)
- [Buf Documentation](https://buf.build/docs/)
- [Result Type Pattern](https://en.wikipedia.org/wiki/Result_type)

## License

ISC
