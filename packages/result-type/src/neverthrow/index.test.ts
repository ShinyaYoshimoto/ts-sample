import { describe, expect, it } from 'vitest';
import {
	type CreateUserInput,
	checkUserExists,
	registerUser,
	registerUserFunctional,
	saveUser,
	validateInput,
} from './index';

describe('neverthrow implementation', () => {
	describe('validateInput', () => {
		it('should return ok for valid input', async () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = await validateInput(input);
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(input);
			}
		});

		it('should return ValidationError for empty email', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'John Doe',
			};
			const result = await validateInput(input);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('ValidationError');
				expect(result.error.message).toBe('Email is required');
			}
		});

		it('should return ValidationError for invalid email format', async () => {
			const input: CreateUserInput = {
				email: 'invalid-email',
				name: 'John Doe',
			};
			const result = await validateInput(input);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('ValidationError');
				expect(result.error.message).toBe('Invalid email format');
			}
		});

		it('should return ValidationError for empty name', async () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: '',
			};
			const result = await validateInput(input);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('ValidationError');
				expect(result.error.message).toBe('Name is required');
			}
		});
	});

	describe('checkUserExists', () => {
		it('should return ok if user does not exist', async () => {
			const result = await checkUserExists('newuser@example.com');
			expect(result.isOk()).toBe(true);
		});

		it('should return ConflictError if user exists', async () => {
			const result = await checkUserExists('test@example.com');
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('ConflictError');
				expect(result.error.message).toContain('already exists');
			}
		});
	});

	describe('saveUser', () => {
		it('should return ok when save succeeds', async () => {
			const user = {
				id: 'user-123',
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = await saveUser(user);
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toEqual(user);
			}
		});

		it('should return InfrastructureError when save fails', async () => {
			const user = {
				id: 'user-123',
				email: 'fail@example.com',
				name: 'John Doe',
			};
			const result = await saveUser(user);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('InfrastructureError');
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
			const result = await registerUser(input);
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
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
			const result = await registerUser(input);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('ValidationError');
			}
		});

		it('should return ConflictError if user exists', async () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUser(input);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('ConflictError');
			}
		});

		it('should return InfrastructureError if save fails', async () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUser(input);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('InfrastructureError');
			}
		});
	});

	describe('registerUserFunctional', () => {
		it('should successfully register a valid user', async () => {
			const input: CreateUserInput = {
				email: 'newuser2@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUserFunctional(input);
			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value.email).toBe(input.email);
				expect(result.value.name).toBe(input.name);
			}
		});

		it('should return ConflictError if user exists', async () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = await registerUserFunctional(input);
			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error._tag).toBe('ConflictError');
			}
		});
	});
});
