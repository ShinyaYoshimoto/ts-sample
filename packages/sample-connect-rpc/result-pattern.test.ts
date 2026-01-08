import { describe, it, expect } from 'vitest';
import { UserClient } from './src/client/user-client';

describe('Connect-RPC Result Pattern', () => {
	const client = new UserClient();

	describe('Success Cases', () => {
		it('should register a user successfully with valid input', async () => {
			const result = await client.registerUser('John Doe', 'john@example.com');

			expect(result.success).toBe(true);
			expect(result.userId).toBeDefined();
			expect(result.userId).toMatch(/^user_\d+$/);
			expect(result.errorCode).toBeUndefined();
			expect(result.errorMessage).toBeUndefined();
		});

		it('should register a user with alternative method', async () => {
			const result = await client.registerUserAlt(
				'Jane Doe',
				'jane@example.com',
			);

			expect(result.success).toBe(true);
			expect(result.userId).toBeDefined();
			expect(result.errorCode).toBeUndefined();
		});
	});

	describe('Error Cases', () => {
		it('should return error for invalid email', async () => {
			const result = await client.registerUser('John Doe', 'invalid-email');

			expect(result.success).toBe(false);
			expect(result.errorCode).toBe('INVALID_EMAIL');
			expect(result.errorMessage).toBe('Email address is invalid');
			expect(result.userId).toBeUndefined();
		});

		it('should return error for empty email', async () => {
			const result = await client.registerUser('John Doe', '');

			expect(result.success).toBe(false);
			expect(result.errorCode).toBe('INVALID_EMAIL');
			expect(result.errorMessage).toBe('Email address is invalid');
		});

		it('should return error for empty name', async () => {
			const result = await client.registerUser('', 'john@example.com');

			expect(result.success).toBe(false);
			expect(result.errorCode).toBe('INVALID_NAME');
			expect(result.errorMessage).toBe('Name is required');
		});

		it('should return error for whitespace-only name', async () => {
			const result = await client.registerUser('   ', 'john@example.com');

			expect(result.success).toBe(false);
			expect(result.errorCode).toBe('INVALID_NAME');
			expect(result.errorMessage).toBe('Name is required');
		});
	});

	describe('TypeScript Union Type Verification', () => {
		it('demonstrates discriminated union with case property', async () => {
			// This test verifies the TypeScript type system
			// The generated code creates a discriminated union with 'case' property
			const successResult = await client.registerUser(
				'Test User',
				'test@example.com',
			);
			const errorResult = await client.registerUser('', 'test@example.com');

			// Both results have the same structure but different success values
			expect(successResult).toHaveProperty('success');
			expect(errorResult).toHaveProperty('success');

			// Success result has userId
			if (successResult.success) {
				expect(successResult.userId).toBeDefined();
			}

			// Error result has error fields
			if (!errorResult.success) {
				expect(errorResult.errorCode).toBeDefined();
				expect(errorResult.errorMessage).toBeDefined();
			}
		});
	});
});
