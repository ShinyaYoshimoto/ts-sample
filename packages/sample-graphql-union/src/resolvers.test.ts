import { describe, it, expect, beforeEach } from 'vitest';
import { resolvers } from './resolvers';
import type { RegisterUserResult } from './resolvers';

describe('GraphQL Union Result Pattern - Server', () => {
  describe('registerUser mutation', () => {
    // Reset users before each test by re-importing
    beforeEach(() => {
      // Note: In a real scenario, we'd reset the database
      // For this simple example, the in-memory array persists
    });

    it('should successfully register a valid user', () => {
      const result = resolvers.Mutation.registerUser(null, {
        email: 'test@example.com',
        name: 'Test User',
      }) as RegisterUserResult;

      expect(result.__typename).toBe('User');
      if (result.__typename === 'User') {
        expect(result.email).toBe('test@example.com');
        expect(result.name).toBe('Test User');
        expect(result.id).toBeDefined();
      }
    });

    it('should return ValidationError for invalid email', () => {
      const result = resolvers.Mutation.registerUser(null, {
        email: 'invalid-email',
        name: 'Test User',
      }) as RegisterUserResult;

      expect(result.__typename).toBe('ValidationError');
      if (result.__typename === 'ValidationError') {
        expect(result.message).toContain('Invalid email format');
        expect(result.field).toBe('email');
      }
    });

    it('should return ValidationError for empty name', () => {
      const result = resolvers.Mutation.registerUser(null, {
        email: 'test2@example.com',
        name: '',
      }) as RegisterUserResult;

      expect(result.__typename).toBe('ValidationError');
      if (result.__typename === 'ValidationError') {
        expect(result.message).toContain('Name cannot be empty');
        expect(result.field).toBe('name');
      }
    });

    it('should return ValidationError for name too short', () => {
      const result = resolvers.Mutation.registerUser(null, {
        email: 'test3@example.com',
        name: 'A',
      }) as RegisterUserResult;

      expect(result.__typename).toBe('ValidationError');
      if (result.__typename === 'ValidationError') {
        expect(result.message).toContain('at least 2 characters');
        expect(result.field).toBe('name');
      }
    });

    it('should return ConflictError for duplicate email', () => {
      const email = 'duplicate@example.com';
      
      // First registration should succeed
      const firstResult = resolvers.Mutation.registerUser(null, {
        email,
        name: 'First User',
      }) as RegisterUserResult;
      
      expect(firstResult.__typename).toBe('User');

      // Second registration with same email should fail
      const secondResult = resolvers.Mutation.registerUser(null, {
        email,
        name: 'Second User',
      }) as RegisterUserResult;

      expect(secondResult.__typename).toBe('ConflictError');
      if (secondResult.__typename === 'ConflictError') {
        expect(secondResult.message).toContain('already exists');
        expect(secondResult.conflictingId).toBeDefined();
      }
    });

    it('should handle multiple error types correctly', () => {
      const testCases = [
        {
          input: { email: 'valid@test.com', name: 'Valid Name' },
          expectedType: 'User',
        },
        {
          input: { email: 'invalid', name: 'Name' },
          expectedType: 'ValidationError',
        },
        {
          input: { email: 'another@test.com', name: 'X' },
          expectedType: 'ValidationError',
        },
      ];

      testCases.forEach(({ input, expectedType }) => {
        const result = resolvers.Mutation.registerUser(
          null,
          input
        ) as RegisterUserResult;
        expect(result.__typename).toBe(expectedType);
      });
    });
  });

  describe('RegisterUserResult union type resolution', () => {
    it('should resolve __typename correctly for User', () => {
      const user = {
        __typename: 'User' as const,
        id: '1',
        email: 'test@example.com',
        name: 'Test',
      };

      const resolved = resolvers.RegisterUserResult.__resolveType(user);
      expect(resolved).toBe('User');
    });

    it('should resolve __typename correctly for ValidationError', () => {
      const error = {
        __typename: 'ValidationError' as const,
        message: 'Error',
        field: 'email',
      };

      const resolved = resolvers.RegisterUserResult.__resolveType(error);
      expect(resolved).toBe('ValidationError');
    });

    it('should resolve __typename correctly for ConflictError', () => {
      const error = {
        __typename: 'ConflictError' as const,
        message: 'Conflict',
        conflictingId: '123',
      };

      const resolved = resolvers.RegisterUserResult.__resolveType(error);
      expect(resolved).toBe('ConflictError');
    });
  });
});
