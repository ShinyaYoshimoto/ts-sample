import { describe, expect, it } from 'vitest';
import {
	type CreateUserInput,
	registerUser,
	registerUserNullable,
} from './index';

describe('pure TypeScript implementation (no Result types)', () => {
	describe('registerUserNullable', () => {
		it('should successfully register a valid user', () => {
			const input: CreateUserInput = {
				email: 'newuser3@example.com',
				name: 'Jane Doe',
			};
			const result = registerUserNullable(input);
			expect(result).not.toBeNull();
			if (result) {
				expect(result.email).toBe(input.email);
				expect(result.name).toBe(input.name);
			}
		});

		it('should return null for invalid input', () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Jane Doe',
			};
			const result = registerUserNullable(input);
			expect(result).toBeNull();
		});

		it('should return null if user exists', () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = registerUserNullable(input);
			expect(result).toBeNull();
		});

		it('should return null if save fails', () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = registerUserNullable(input);
			expect(result).toBeNull();
		});
	});

	describe('error handling comparison', () => {
		it('demonstrates try-catch overhead', () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Test User',
			};

			// With try-catch, you lose error type safety without explicit checks
			const result = registerUser(input);
			expect(result.success).toBe(false);
		});

		it('demonstrates null pattern loses error information', () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Test User',
			};

			// With null return, we completely lose error information
			const result = registerUserNullable(input);
			expect(result).toBeNull();
			// Can't tell why it failed - validation? conflict? infrastructure?
		});
	});
});
