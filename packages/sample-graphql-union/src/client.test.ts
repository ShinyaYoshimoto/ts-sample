import { describe, it, expect } from 'vitest';
import {
  handleRegisterUserResult,
  handleRegisterUserResultWithGuards,
  processRegistrations,
  isUser,
  isValidationError,
  isConflictError,
} from './client';

describe('GraphQL Union Result Pattern - Client', () => {
  describe('handleRegisterUserResult', () => {
    it('should handle User result correctly', () => {
      const result = {
        __typename: 'User' as const,
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const handled = handleRegisterUserResult(result);
      expect(handled.success).toBe(true);
      expect(handled.message).toContain('Test User');
      expect(handled.message).toContain('registered successfully');
      expect(handled.user).toBeDefined();
      expect(handled.user?.id).toBe('123');
    });

    it('should handle ValidationError result correctly', () => {
      const result = {
        __typename: 'ValidationError' as const,
        message: 'Invalid email format',
        field: 'email',
      };

      const handled = handleRegisterUserResult(result);
      expect(handled.success).toBe(false);
      expect(handled.message).toContain('Validation failed');
      expect(handled.message).toContain('Invalid email format');
      expect(handled.message).toContain('email');
      expect(handled.user).toBeUndefined();
    });

    it('should handle ConflictError result correctly', () => {
      const result = {
        __typename: 'ConflictError' as const,
        message: 'User already exists',
        conflictingId: '456',
      };

      const handled = handleRegisterUserResult(result);
      expect(handled.success).toBe(false);
      expect(handled.message).toContain('Conflict');
      expect(handled.message).toContain('User already exists');
      expect(handled.message).toContain('456');
      expect(handled.user).toBeUndefined();
    });
  });

  describe('handleRegisterUserResultWithGuards', () => {
    it('should handle User with type guard', () => {
      const result = {
        __typename: 'User' as const,
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const message = handleRegisterUserResultWithGuards(result);
      expect(message).toContain('Success');
      expect(message).toContain('123');
    });

    it('should handle ValidationError with type guard', () => {
      const result = {
        __typename: 'ValidationError' as const,
        message: 'Invalid input',
        field: 'name',
      };

      const message = handleRegisterUserResultWithGuards(result);
      expect(message).toContain('Validation Error');
      expect(message).toContain('Invalid input');
    });

    it('should handle ConflictError with type guard', () => {
      const result = {
        __typename: 'ConflictError' as const,
        message: 'Duplicate entry',
        conflictingId: '789',
      };

      const message = handleRegisterUserResultWithGuards(result);
      expect(message).toContain('Conflict');
      expect(message).toContain('Duplicate entry');
    });
  });

  describe('processRegistrations', () => {
    it('should categorize multiple results correctly', () => {
      const results = [
        {
          __typename: 'User' as const,
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
        },
        {
          __typename: 'ValidationError' as const,
          message: 'Invalid email',
          field: 'email',
        },
        {
          __typename: 'User' as const,
          id: '2',
          email: 'user2@test.com',
          name: 'User 2',
        },
        {
          __typename: 'ConflictError' as const,
          message: 'Already exists',
          conflictingId: '3',
        },
        {
          __typename: 'ValidationError' as const,
          message: 'Name too short',
          field: 'name',
        },
      ];

      const processed = processRegistrations(results);

      expect(processed.successful).toHaveLength(2);
      expect(processed.validationErrors).toHaveLength(2);
      expect(processed.conflictErrors).toHaveLength(1);

      expect(processed.successful[0].id).toBe('1');
      expect(processed.successful[1].id).toBe('2');
      expect(processed.validationErrors[0].field).toBe('email');
      expect(processed.conflictErrors[0].conflictingId).toBe('3');
    });

    it('should handle empty results array', () => {
      const processed = processRegistrations([]);
      
      expect(processed.successful).toHaveLength(0);
      expect(processed.validationErrors).toHaveLength(0);
      expect(processed.conflictErrors).toHaveLength(0);
    });
  });

  describe('Type predicate functions', () => {
    const userResult = {
      __typename: 'User' as const,
      id: '123',
      email: 'test@example.com',
      name: 'Test',
    };

    const validationErrorResult = {
      __typename: 'ValidationError' as const,
      message: 'Error',
      field: 'email',
    };

    const conflictErrorResult = {
      __typename: 'ConflictError' as const,
      message: 'Conflict',
      conflictingId: '456',
    };

    describe('isUser', () => {
      it('should return true for User', () => {
        expect(isUser(userResult)).toBe(true);
      });

      it('should return false for non-User', () => {
        expect(isUser(validationErrorResult)).toBe(false);
        expect(isUser(conflictErrorResult)).toBe(false);
      });

      it('should narrow type correctly', () => {
        if (isUser(userResult)) {
          // TypeScript should know this is User
          expect(userResult.id).toBeDefined();
          expect(userResult.email).toBeDefined();
          expect(userResult.name).toBeDefined();
        }
      });
    });

    describe('isValidationError', () => {
      it('should return true for ValidationError', () => {
        expect(isValidationError(validationErrorResult)).toBe(true);
      });

      it('should return false for non-ValidationError', () => {
        expect(isValidationError(userResult)).toBe(false);
        expect(isValidationError(conflictErrorResult)).toBe(false);
      });

      it('should narrow type correctly', () => {
        if (isValidationError(validationErrorResult)) {
          // TypeScript should know this is ValidationError
          expect(validationErrorResult.message).toBeDefined();
          expect(validationErrorResult.field).toBeDefined();
        }
      });
    });

    describe('isConflictError', () => {
      it('should return true for ConflictError', () => {
        expect(isConflictError(conflictErrorResult)).toBe(true);
      });

      it('should return false for non-ConflictError', () => {
        expect(isConflictError(userResult)).toBe(false);
        expect(isConflictError(validationErrorResult)).toBe(false);
      });

      it('should narrow type correctly', () => {
        if (isConflictError(conflictErrorResult)) {
          // TypeScript should know this is ConflictError
          expect(conflictErrorResult.message).toBeDefined();
          expect(conflictErrorResult.conflictingId).toBeDefined();
        }
      });
    });
  });

  describe('Type safety and exhaustiveness', () => {
    it('should demonstrate compile-time type safety', () => {
      type RegisterUserResult =
        | { __typename: 'User'; id: string; email: string; name: string }
        | { __typename: 'ValidationError'; message: string; field?: string }
        | { __typename: 'ConflictError'; message: string; conflictingId?: string };

      function exhaustiveCheck(result: RegisterUserResult): string {
        switch (result.__typename) {
          case 'User':
            return result.id; // TypeScript knows all User properties
          case 'ValidationError':
            return result.message; // TypeScript knows all ValidationError properties
          case 'ConflictError':
            return result.message; // TypeScript knows all ConflictError properties
          default:
            // This ensures all cases are handled
            const _exhaustive: never = result;
            return 'unreachable';
        }
      }

      const user = {
        __typename: 'User' as const,
        id: '1',
        email: 'test@test.com',
        name: 'Test',
      };
      expect(exhaustiveCheck(user)).toBe('1');
    });
  });
});
