import { Result } from '@praha/byethrow';
import { describe, expect, it } from 'vitest';
import {
	type CreateUserInput,
	checkUserExists,
	registerUser,
	registerUserAsync,
	saveUser,
	validateInput,
} from './index';

describe('byethrow implementation', () => {
	describe('validateInput', () => {
		it('should return success for valid input', () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = validateInput(input);
			expect(Result.isSuccess(result)).toBe(true);
			if (Result.isSuccess(result)) {
				expect(result.value).toEqual(input);
			}
		});

		it('should return ValidationError for empty email', () => {
			const input: CreateUserInput = {
				email: '',
				name: 'John Doe',
			};
			const result = validateInput(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('ValidationError');
				expect(result.error.message).toBe('Email is required');
			}
		});

		it('should return ValidationError for invalid email format', () => {
			const input: CreateUserInput = {
				email: 'invalid-email',
				name: 'John Doe',
			};
			const result = validateInput(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('ValidationError');
				expect(result.error.message).toBe('Invalid email format');
			}
		});

		it('should return ValidationError for empty name', () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: '',
			};
			const result = validateInput(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('ValidationError');
				expect(result.error.message).toBe('Name is required');
			}
		});
	});

	describe('checkUserExists', () => {
		it('should return success if user does not exist', () => {
			const result = checkUserExists('newuser@example.com');
			expect(Result.isSuccess(result)).toBe(true);
		});

		it('should return ConflictError if user exists', () => {
			const result = checkUserExists('test@example.com');
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('ConflictError');
				expect(result.error.message).toContain('already exists');
			}
		});
	});

	describe('saveUser', () => {
		it('should return success when save succeeds', () => {
			const user = {
				id: 'user-123',
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = saveUser(user);
			expect(Result.isSuccess(result)).toBe(true);
			if (Result.isSuccess(result)) {
				expect(result.value).toEqual(user);
			}
		});

		it('should return InfrastructureError when save fails', () => {
			const user = {
				id: 'user-123',
				email: 'fail@example.com',
				name: 'John Doe',
			};
			const result = saveUser(user);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('InfrastructureError');
				expect(result.error.message).toContain('Failed to save');
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
			expect(Result.isSuccess(result)).toBe(true);
			if (Result.isSuccess(result)) {
				expect(result.value.email).toBe(input.email);
				expect(result.value.name).toBe(input.name);
				expect(result.value.id).toBeDefined();
			}
		});

		it('should return ValidationError for invalid input', () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Jane Doe',
			};
			const result = registerUser(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('ValidationError');
			}
		});

		it('should return ConflictError if user exists', () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = registerUser(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('ConflictError');
			}
		});

		it('should return InfrastructureError if save fails', () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = registerUser(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
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
			expect(Result.isSuccess(result)).toBe(true);
			if (Result.isSuccess(result)) {
				expect(result.value.email).toBe(input.email);
				expect(result.value.name).toBe(input.name);
			}
		});

		it('should return ConflictError if user exists', async () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUserAsync(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('ConflictError');
			}
		});

		it('should return InfrastructureError if save fails', async () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUserAsync(input);
			expect(Result.isFailure(result)).toBe(true);
			if (Result.isFailure(result)) {
				expect(result.error._tag).toBe('InfrastructureError');
			}
		});
	});

	describe('byethrow API usage', () => {
		it('should work with Result.isSuccess', () => {
			const result = Result.succeed(42);
			expect(Result.isSuccess(result)).toBe(true);
		});

		it('should work with Result.isFailure', () => {
			const result = Result.fail('error');
			expect(Result.isFailure(result)).toBe(true);
		});

		it('should support pipe composition', () => {
			const result = Result.pipe(
				Result.succeed(5),
				Result.andThen((x) => Result.succeed(x * 2)),
				Result.andThen((x) => Result.succeed(x + 1)),
			);
			expect(Result.isSuccess(result)).toBe(true);
			if (Result.isSuccess(result)) {
				expect(result.value).toBe(11);
			}
		});
	});
});
