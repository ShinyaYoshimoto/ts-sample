import { describe, it, expect } from 'vitest';
import { appRouter } from './server';
import type { User, AppError } from './types';
import type { Result } from './result';

/**
 * Test helper to create a caller for the router
 * This simulates what would happen when calling through tRPC
 */
const createCaller = () => {
	return appRouter.createCaller({});
};

describe('tRPC Result Type Propagation', () => {
	describe('Server-side Result creation', () => {
		it('should return success result for valid user registration', async () => {
			const caller = createCaller();
			const result = await caller.registerUser({
				name: 'John Doe',
				email: 'john@example.com',
			});

			expect(result.status).toBe('ok');
			if (result.status === 'ok') {
				// Type narrowing should work here
				expect(result.data).toBeDefined();
				expect(result.data.name).toBe('John Doe');
				expect(result.data.email).toBe('john@example.com');
				expect(result.data.id).toBeDefined();
			}
		});

		it('should return failure result for invalid name', async () => {
			const caller = createCaller();
			const result = await caller.registerUser({
				name: 'J',
				email: 'j@example.com',
			});

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				// Type narrowing should work here
				expect(result.error).toBeDefined();
				expect(result.error.type).toBe('VALIDATION_ERROR');
				if (result.error.type === 'VALIDATION_ERROR') {
					expect(result.error.message).toContain('Name must be at least 2 characters');
				}
			}
		});

		it('should return failure result for invalid email', async () => {
			const caller = createCaller();
			const result = await caller.registerUser({
				name: 'Jane Doe',
				email: 'invalid-email',
			});

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error.type).toBe('VALIDATION_ERROR');
				if (result.error.type === 'VALIDATION_ERROR') {
					expect(result.error.message).toContain('Invalid email format');
				}
			}
		});

		it('should return failure result for duplicate email', async () => {
			const caller = createCaller();
			
			// Register first user
			await caller.registerUser({
				name: 'First User',
				email: 'duplicate@example.com',
			});

			// Try to register with same email
			const result = await caller.registerUser({
				name: 'Second User',
				email: 'duplicate@example.com',
			});

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error.type).toBe('DUPLICATE_EMAIL');
				if (result.error.type === 'DUPLICATE_EMAIL') {
					expect(result.error.email).toBe('duplicate@example.com');
				}
			}
		});
	});

	describe('Type Narrowing Verification', () => {
		it('should narrow types correctly based on status field', async () => {
			const caller = createCaller();
			const result: Result<User, AppError> = await caller.registerUser({
				name: 'Type Test',
				email: 'type@example.com',
			});

			// This test verifies that TypeScript correctly narrows the type
			if (result.status === 'ok') {
				// At this point, TypeScript should know result is Success<User>
				const user: User = result.data; // Should not have type error
				expect(user.name).toBe('Type Test');
				
				// Accessing result.error here would be a TypeScript error
				// @ts-expect-error - error should not exist on success result
				const shouldNotExist = result.error;
				expect(shouldNotExist).toBeUndefined();
			} else {
				// At this point, TypeScript should know result is Failure<AppError>
				const error: AppError = result.error; // Should not have type error
				expect(error).toBeDefined();
				
				// Accessing result.data here would be a TypeScript error
				// @ts-expect-error - data should not exist on failure result
				const shouldNotExist = result.data;
				expect(shouldNotExist).toBeUndefined();
			}
		});

		it('should handle success case with proper type inference', async () => {
			const caller = createCaller();
			const result = await caller.registerUser({
				name: 'Success Test',
				email: 'success@example.com',
			});

			// Pattern matching style
			const message = result.status === 'ok'
				? `User created: ${result.data.name}`
				: `Error: ${result.error.type}`;

			expect(message).toBe('User created: Success Test');
		});

		it('should handle failure case with proper type inference', async () => {
			const caller = createCaller();
			const result = await caller.registerUser({
				name: 'X',
				email: 'x@example.com',
			});

			// Pattern matching style
			const message = result.status === 'ok'
				? `User created: ${result.data.name}`
				: `Error: ${result.error.type}`;

			expect(message).toBe('Error: VALIDATION_ERROR');
		});
	});

	describe('Exhaustive Error Type Handling', () => {
		it('should handle all error types correctly', async () => {
			const caller = createCaller();
			
			// Test VALIDATION_ERROR
			const validationError = await caller.registerUser({
				name: '',
				email: 'test@example.com',
			});
			expect(validationError.status).toBe('error');
			if (validationError.status === 'error') {
				expect(validationError.error.type).toBe('VALIDATION_ERROR');
			}

			// Test DUPLICATE_EMAIL
			await caller.registerUser({
				name: 'First',
				email: 'dup@example.com',
			});
			const duplicateError = await caller.registerUser({
				name: 'Second',
				email: 'dup@example.com',
			});
			expect(duplicateError.status).toBe('error');
			if (duplicateError.status === 'error') {
				expect(duplicateError.error.type).toBe('DUPLICATE_EMAIL');
			}
		});
	});

	describe('Client-side type safety demonstration', () => {
		it('should demonstrate type-safe client usage pattern', async () => {
			const caller = createCaller();
			
			// Simulating client-side code
			const processRegistration = async (name: string, email: string): Promise<string> => {
				const response = await caller.registerUser({ name, email });
				
				// Type narrowing works seamlessly
				if (response.status === 'ok') {
					// response.data is correctly typed as User
					return `Welcome, ${response.data.name}!`;
				}
				
				// response.error is correctly typed as AppError
				switch (response.error.type) {
					case 'VALIDATION_ERROR':
						return `Validation failed: ${response.error.message}`;
					case 'DUPLICATE_EMAIL':
						return `Email ${response.error.email} is already registered`;
					case 'DATABASE_ERROR':
						return `System error: ${response.error.message}`;
				}
			};

			const successMessage = await processRegistration('Alice', 'alice@example.com');
			expect(successMessage).toBe('Welcome, Alice!');

			const failureMessage = await processRegistration('A', 'a@example.com');
			expect(failureMessage).toContain('Validation failed');
		});
	});
});
