// Type definitions for our domain
export type User = {
  __typename: 'User';
  id: string;
  email: string;
  name: string;
};

export type ValidationError = {
  __typename: 'ValidationError';
  message: string;
  field?: string;
};

export type ConflictError = {
  __typename: 'ConflictError';
  message: string;
  conflictingId?: string;
};

export type RegisterUserResult = User | ValidationError | ConflictError;

// Simple in-memory database
const users: User[] = [];

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if user already exists
function userExists(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL Union Result Pattern!',
  },
  Mutation: {
    registerUser: (
      _parent: unknown,
      args: { email: string; name: string }
    ): RegisterUserResult => {
      const { email, name } = args;

      // Validation: Check if email is valid
      if (!isValidEmail(email)) {
        return {
          __typename: 'ValidationError',
          message: 'Invalid email format',
          field: 'email',
        };
      }

      // Validation: Check if name is not empty
      if (!name || name.trim().length === 0) {
        return {
          __typename: 'ValidationError',
          message: 'Name cannot be empty',
          field: 'name',
        };
      }

      // Validation: Check if name is too short
      if (name.trim().length < 2) {
        return {
          __typename: 'ValidationError',
          message: 'Name must be at least 2 characters long',
          field: 'name',
        };
      }

      // Conflict: Check if user already exists
      const existingUser = userExists(email);
      if (existingUser) {
        return {
          __typename: 'ConflictError',
          message: 'User with this email already exists',
          conflictingId: existingUser.id,
        };
      }

      // Success: Create new user
      const newUser: User = {
        __typename: 'User',
        id: `user-${users.length + 1}`,
        email,
        name: name.trim(),
      };

      users.push(newUser);
      return newUser;
    },
  },
  RegisterUserResult: {
    __resolveType(obj: RegisterUserResult) {
      return obj.__typename;
    },
  },
};
