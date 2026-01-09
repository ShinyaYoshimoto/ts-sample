import { Result, ok, err } from 'neverthrow';

// ========================================
// Data Models & Errors
// ========================================

export type User = { id: string; email: string; name: string };
export type CreateUserInput = { email: string; name: string };

// Errors
export type ValidationError = { _tag: 'ValidationError'; message: string };
export type ConflictError = { _tag: 'ConflictError'; message: string };
export type InfrastructureError = {
	_tag: 'InfrastructureError';
	message: string;
};

export type AppError = ValidationError | ConflictError | InfrastructureError;

// ========================================
// Mock Services
// ========================================

/**
 * Validates the input for creating a user.
 * Returns ValidationError if email is empty or invalid format.
 * 
 * NOTE: This uses simplified validation for demonstration purposes.
 * Production code should use a proper email validation library.
 */
export async function validateInput(
	input: CreateUserInput,
): Promise<Result<CreateUserInput, ValidationError>> {
	// Simple email validation (for demo purposes only)
	if (!input.email || input.email.trim() === '') {
		return err({
			_tag: 'ValidationError',
			message: 'Email is required',
		});
	}

	if (!input.email.includes('@')) {
		return err({
			_tag: 'ValidationError',
			message: 'Invalid email format',
		});
	}

	if (!input.name || input.name.trim() === '') {
		return err({
			_tag: 'ValidationError',
			message: 'Name is required',
		});
	}

	return ok(input);
}

/**
 * Checks if a user with the given email already exists.
 * Returns ConflictError if user exists.
 */
export async function checkUserExists(
	email: string,
): Promise<Result<void, ConflictError>> {
	// Mock: user with test@example.com already exists
	if (email === 'test@example.com') {
		return err({
			_tag: 'ConflictError',
			message: `User with email ${email} already exists`,
		});
	}

	return ok(undefined);
}

/**
 * Saves a user to the database.
 * Returns InfrastructureError on failure.
 */
export async function saveUser(
	user: User,
): Promise<Result<User, InfrastructureError>> {
	// Mock: simulate random infrastructure failure
	const shouldFail = user.email.includes('fail');

	if (shouldFail) {
		return err({
			_tag: 'InfrastructureError',
			message: 'Failed to save user to database',
		});
	}

	return ok(user);
}

// ========================================
// Main UseCase: Register User
// ========================================

/**
 * Registers a new user by validating input, checking for conflicts,
 * and saving to the database.
 *
 * This demonstrates neverthrow's Result composition using resultAsync
 * for elegant error handling without try-catch blocks.
 */
export async function registerUser(
	input: CreateUserInput,
): Promise<Result<User, AppError>> {
	// Validate input
	const validationResult = await validateInput(input);
	if (validationResult.isErr()) {
		return err(validationResult.error);
	}

	const validatedInput = validationResult.value;

	// Check if user exists
	const existsResult = await checkUserExists(validatedInput.email);
	if (existsResult.isErr()) {
		return err(existsResult.error);
	}

	// Create user object
	const user: User = {
		id: `user-${Date.now()}`,
		email: validatedInput.email,
		name: validatedInput.name,
	};

	// Save user
	const saveResult = await saveUser(user);
	if (saveResult.isErr()) {
		return err(saveResult.error);
	}

	return ok(saveResult.value);
}

// ========================================
// Alternative: Using neverthrow's ResultAsync for better composition
// ========================================

import { ResultAsync } from 'neverthrow';

/**
 * Alternative implementation using ResultAsync for more functional composition.
 * This shows the power of neverthrow's chaining capabilities.
 */
export function registerUserFunctional(
	input: CreateUserInput,
): ResultAsync<User, AppError> {
	// Convert Promise<Result> to ResultAsync by awaiting and checking
	const validationAsync = new ResultAsync(validateInput(input));

	return validationAsync
		.andThen((validatedInput) => {
			const conflictCheckAsync = new ResultAsync(
				checkUserExists(validatedInput.email),
			);
			return conflictCheckAsync.map(() => validatedInput);
		})
		.andThen((validatedInput) => {
			const user: User = {
				id: `user-${Date.now()}`,
				email: validatedInput.email,
				name: validatedInput.name,
			};
			return new ResultAsync(saveUser(user));
		});
}
