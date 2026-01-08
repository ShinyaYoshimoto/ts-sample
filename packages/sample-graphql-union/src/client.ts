// Client-side type definitions matching the GraphQL schema
// These would typically be manually written or generated

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

// GraphQL query result type
type RegisterUserMutationResponse = {
  registerUser: RegisterUserResult;
};

/**
 * Type-safe handler for RegisterUserResult using __typename discrimination
 */
export function handleRegisterUserResult(result: RegisterUserResult): {
  success: boolean;
  message: string;
  user?: User;
} {
  // Type narrowing based on __typename
  switch (result.__typename) {
    case 'User':
      return {
        success: true,
        message: `User ${result.name} registered successfully`,
        user: result,
      };

    case 'ValidationError':
      return {
        success: false,
        message: `Validation failed: ${result.message}${
          result.field ? ` (field: ${result.field})` : ''
        }`,
      };

    case 'ConflictError':
      return {
        success: false,
        message: `Conflict: ${result.message}${
          result.conflictingId ? ` (ID: ${result.conflictingId})` : ''
        }`,
      };

    default:
      // Exhaustiveness check - TypeScript will error if we miss a case
      const _exhaustive: never = result;
      return {
        success: false,
        message: 'Unknown error type',
      };
  }
}

/**
 * Alternative approach: Using if-else with type guards
 */
export function handleRegisterUserResultWithGuards(
  result: RegisterUserResult
): string {
  if (result.__typename === 'User') {
    // TypeScript knows result is User here
    return `✅ Success! User registered with ID: ${result.id}`;
  }

  if (result.__typename === 'ValidationError') {
    // TypeScript knows result is ValidationError here
    return `❌ Validation Error: ${result.message}`;
  }

  if (result.__typename === 'ConflictError') {
    // TypeScript knows result is ConflictError here
    return `⚠️  Conflict: ${result.message}`;
  }

  // Exhaustiveness check
  const _exhaustive: never = result;
  return 'Unknown error';
}

/**
 * Example: Processing multiple registration attempts
 */
export function processRegistrations(
  results: RegisterUserResult[]
): {
  successful: User[];
  validationErrors: ValidationError[];
  conflictErrors: ConflictError[];
} {
  const successful: User[] = [];
  const validationErrors: ValidationError[] = [];
  const conflictErrors: ConflictError[] = [];

  for (const result of results) {
    switch (result.__typename) {
      case 'User':
        successful.push(result);
        break;
      case 'ValidationError':
        validationErrors.push(result);
        break;
      case 'ConflictError':
        conflictErrors.push(result);
        break;
    }
  }

  return { successful, validationErrors, conflictErrors };
}

/**
 * Type predicate functions for more flexible type narrowing
 */
export function isUser(result: RegisterUserResult): result is User {
  return result.__typename === 'User';
}

export function isValidationError(
  result: RegisterUserResult
): result is ValidationError {
  return result.__typename === 'ValidationError';
}

export function isConflictError(
  result: RegisterUserResult
): result is ConflictError {
  return result.__typename === 'ConflictError';
}

/**
 * GraphQL mutation for registering a user
 */
const REGISTER_USER_MUTATION = `
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

/**
 * Example client function that makes a GraphQL request
 * (This is a mock - in real app, use fetch or GraphQL client)
 */
export async function registerUser(
  email: string,
  name: string,
  endpoint: string = 'http://localhost:4000/graphql'
): Promise<RegisterUserResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: REGISTER_USER_MUTATION,
      variables: { email, name },
    }),
  });

  const json = await response.json();
  return json.data.registerUser as RegisterUserResult;
}
