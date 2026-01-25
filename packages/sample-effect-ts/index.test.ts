import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import {
	ConflictError,
	type CreateUserInput,
	InfrastructureError,
	ValidationError,
	checkUserExists,
	registerUser,
	runEffect,
	saveUser,
	validateInput,
} from './index';

describe('effect-ts implementation', () => {
	describe('validateInput', () => {
		it('should return success for valid input', async () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = await runEffect(validateInput(input));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value).toEqual(input);
			}
		});

		it('should return ValidationError for empty email', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'John Doe',
			};
			const result = await runEffect(validateInput(input));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe('Email is required');
			}
		});

		it('should return ValidationError for invalid email format', async () => {
			const input: CreateUserInput = {
				email: 'invalid-email',
				name: 'John Doe',
			};
			const result = await runEffect(validateInput(input));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe('Invalid email format');
			}
		});

		it('should return ValidationError for empty name', async () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: '',
			};
			const result = await runEffect(validateInput(input));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe('Name is required');
			}
		});
	});

	describe('checkUserExists', () => {
		it('should return success if user does not exist', async () => {
			const result = await runEffect(checkUserExists('newuser@example.com'));
			expect(result.success).toBe(true);
		});

		it('should return ConflictError if user exists', async () => {
			const result = await runEffect(checkUserExists('test@example.com'));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ConflictError);
				expect(result.error.message).toContain('already exists');
			}
		});
	});

	describe('saveUser', () => {
		it('should return success when save succeeds', async () => {
			const user = {
				id: 'user-123',
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = await runEffect(saveUser(user));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value).toEqual(user);
			}
		});

		it('should return InfrastructureError when save fails', async () => {
			const user = {
				id: 'user-123',
				email: 'fail@example.com',
				name: 'John Doe',
			};
			const result = await runEffect(saveUser(user));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InfrastructureError);
				expect(result.error.message).toContain('Failed to save');
			}
		});
	});

	describe('registerUser', () => {
		it('should successfully register a valid user', async () => {
			const input: CreateUserInput = {
				email: 'newuser@example.com',
				name: 'Jane Doe',
			};
			const result = await runEffect(registerUser(input));
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.email).toBe(input.email);
				expect(result.value.name).toBe(input.name);
				expect(result.value.id).toBeDefined();
			}
		});

		it('should return ValidationError for invalid input', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Jane Doe',
			};
			const result = await runEffect(registerUser(input));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ValidationError);
			}
		});

		it('should return ConflictError if user exists', async () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = await runEffect(registerUser(input));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(ConflictError);
			}
		});

		it('should return InfrastructureError if save fails', async () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = await runEffect(registerUser(input));
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InfrastructureError);
			}
		});
	});

	describe('Effect integration', () => {
		it('should work with Effect.runPromise', async () => {
			const input: CreateUserInput = {
				email: 'direct@example.com',
				name: 'Direct User',
			};
			const user = await Effect.runPromise(registerUser(input));
			expect(user.email).toBe(input.email);
			expect(user.name).toBe(input.name);
		});

		it('should catch errors with Effect.catchAll', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Invalid User',
			};
			const result = await Effect.runPromise(
				Effect.catchAll(registerUser(input), (error) =>
					Effect.succeed({ error: error.message }),
				),
			);
			expect(result).toHaveProperty('error');
			expect((result as any).error).toBe('Email is required');
		});
	});
});
