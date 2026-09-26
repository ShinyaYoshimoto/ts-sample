import { describe, expect, it } from 'vitest';
import {
	type ConflictError,
	type CreateUserInput,
	type InfrastructureError,
	type ValidationError,
	checkUserExists,
	registerUser,
	registerUserAsync,
	registerUserNullable,
	saveUser,
	validateInput,
} from './index';

describe('pure TypeScript implementation (no Result types)', () => {
	describe('validateInput', () => {
		it('should return input for valid data', () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = validateInput(input);
			expect(result).toEqual(input);
		});

		it('should throw ValidationError for empty email', () => {
			const input: CreateUserInput = {
				email: '',
				name: 'John Doe',
			};
			expect(() => validateInput(input)).toThrow();
			try {
				validateInput(input);
			} catch (error) {
				expect((error as ValidationError)._tag).toBe('ValidationError');
				expect((error as ValidationError).message).toBe('Email is required');
			}
		});

		it('should throw ValidationError for invalid email format', () => {
			const input: CreateUserInput = {
				email: 'invalid-email',
				name: 'John Doe',
			};
			expect(() => validateInput(input)).toThrow();
			try {
				validateInput(input);
			} catch (error) {
				expect((error as ValidationError)._tag).toBe('ValidationError');
				expect((error as ValidationError).message).toBe('Invalid email format');
			}
		});

		it('should throw ValidationError for empty name', () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: '',
			};
			expect(() => validateInput(input)).toThrow();
			try {
				validateInput(input);
			} catch (error) {
				expect((error as ValidationError)._tag).toBe('ValidationError');
				expect((error as ValidationError).message).toBe('Name is required');
			}
		});
	});

	describe('checkUserExists', () => {
		it('should not throw if user does not exist', () => {
			expect(() => checkUserExists('newuser@example.com')).not.toThrow();
		});

		it('should throw ConflictError if user exists', () => {
			expect(() => checkUserExists('test@example.com')).toThrow();
			try {
				checkUserExists('test@example.com');
			} catch (error) {
				expect((error as ConflictError)._tag).toBe('ConflictError');
				expect((error as ConflictError).message).toContain('already exists');
			}
		});
	});

	describe('saveUser', () => {
		it('should return user when save succeeds', () => {
			const user = {
				id: 'user-123',
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = saveUser(user);
			expect(result).toEqual(user);
		});

		it('should throw InfrastructureError when save fails', () => {
			const user = {
				id: 'user-123',
				email: 'fail@example.com',
				name: 'John Doe',
			};
			expect(() => saveUser(user)).toThrow();
			try {
				saveUser(user);
			} catch (error) {
				expect((error as InfrastructureError)._tag).toBe('InfrastructureError');
				expect((error as InfrastructureError).message).toContain(
					'Failed to save',
				);
			}
		});
	});

	describe('registerUser', () => {
		it('should successfully register a valid user', () => {
			const input: CreateUserInput = {
				email: 'newuser@example.com',
				name: 'Jane Doe',
			};
			const result = registerUser(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.email).toBe(input.email);
				expect(result.data.name).toBe(input.name);
				expect(result.data.id).toBeDefined();
			}
		});

		it('should return error for invalid input', () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Jane Doe',
			};
			const result = registerUser(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error._tag).toBe('ValidationError');
			}
		});

		it('should return ConflictError if user exists', () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = registerUser(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error._tag).toBe('ConflictError');
			}
		});

		it('should return InfrastructureError if save fails', () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = registerUser(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error._tag).toBe('InfrastructureError');
			}
		});
	});

	describe('registerUserAsync', () => {
		it('should successfully register a valid user', async () => {
			const input: CreateUserInput = {
				email: 'newuser2@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUserAsync(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.email).toBe(input.email);
				expect(result.data.name).toBe(input.name);
			}
		});

		it('should return ConflictError if user exists', async () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUserAsync(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error._tag).toBe('ConflictError');
			}
		});

		it('should return InfrastructureError if save fails', async () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUserAsync(input);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error._tag).toBe('InfrastructureError');
			}
		});
	});

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
