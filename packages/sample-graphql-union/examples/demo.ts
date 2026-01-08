/**
 * Example demonstrating end-to-end usage of GraphQL Union Result Pattern
 * 
 * This example shows:
 * 1. Starting a GraphQL server
 * 2. Making requests to the server
 * 3. Handling different result types with type safety
 * 4. Using __typename for type narrowing
 */

import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../src/schema';
import { resolvers } from '../src/resolvers';

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create a Yoga instance
const yoga = createYoga({
  schema,
});

// Create and start server
const server = createServer(yoga);
const PORT = 4000;

server.listen(PORT, async () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql\n`);

  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 500));

  // Demo 1: Successful registration
  console.log('=== Demo 1: Successful User Registration ===');
  const result1 = await makeRequest({
    email: 'alice@example.com',
    name: 'Alice Smith',
  });
  handleResult(result1);

  // Demo 2: Validation error - invalid email
  console.log('\n=== Demo 2: Validation Error (Invalid Email) ===');
  const result2 = await makeRequest({
    email: 'invalid-email',
    name: 'Bob Johnson',
  });
  handleResult(result2);

  // Demo 3: Validation error - name too short
  console.log('\n=== Demo 3: Validation Error (Name Too Short) ===');
  const result3 = await makeRequest({
    email: 'carol@example.com',
    name: 'C',
  });
  handleResult(result3);

  // Demo 4: Conflict error - duplicate email
  console.log('\n=== Demo 4: Conflict Error (Duplicate Email) ===');
  const result4 = await makeRequest({
    email: 'alice@example.com', // Same as Demo 1
    name: 'Alice Clone',
  });
  handleResult(result4);

  // Demo 5: Another successful registration
  console.log('\n=== Demo 5: Another Successful Registration ===');
  const result5 = await makeRequest({
    email: 'david@example.com',
    name: 'David Wilson',
  });
  handleResult(result5);

  console.log('\n✅ All demos completed! Press Ctrl+C to stop the server.');
});

/**
 * Helper function to make GraphQL request
 */
async function makeRequest(variables: { email: string; name: string }) {
  const query = `
    mutation RegisterUser($email: String!, $name: String!) {
      registerUser(email: $email, name: $name) {
        __typename
        ... on User {
          id
          email
          name
        }
        ... on ValidationError {
          message
          field
        }
        ... on ConflictError {
          message
          conflictingId
        }
      }
    }
  `;

  const response = await fetch(`http://localhost:${PORT}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();
  return json.data.registerUser;
}

/**
 * Result type matching GraphQL union
 */
type User = {
  __typename: 'User';
  id: string;
  email: string;
  name: string;
};

type ValidationError = {
  __typename: 'ValidationError';
  message: string;
  field?: string;
};

type ConflictError = {
  __typename: 'ConflictError';
  message: string;
  conflictingId?: string;
};

type RegisterUserResult = User | ValidationError | ConflictError;

/**
 * Type-safe result handler using __typename discrimination
 */
function handleResult(result: RegisterUserResult) {
  // Type narrowing based on __typename
  switch (result.__typename) {
    case 'User':
      console.log(`Input: email="${result.email}", name="${result.name}"`);
      console.log(`✅ SUCCESS: User registered!`);
      console.log(`   - ID: ${result.id}`);
      console.log(`   - Email: ${result.email}`);
      console.log(`   - Name: ${result.name}`);
      break;

    case 'ValidationError':
      console.log(`Input: Validation failed before processing`);
      console.log(`❌ VALIDATION ERROR: ${result.message}`);
      if (result.field) {
        console.log(`   - Field: ${result.field}`);
      }
      break;

    case 'ConflictError':
      console.log(`Input: Conflict with existing data`);
      console.log(`⚠️  CONFLICT ERROR: ${result.message}`);
      if (result.conflictingId) {
        console.log(`   - Conflicting ID: ${result.conflictingId}`);
      }
      break;

    default:
      // Exhaustiveness check - TypeScript will error if we miss a case
      const _exhaustive: never = result;
      console.log(`❓ UNKNOWN ERROR: Unexpected result type`);
  }
}
