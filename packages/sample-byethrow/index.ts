import { Result } from '@praha/byethrow';

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
export function validateInput(
	input: CreateUserInput,
): Result.Result<CreateUserInput, ValidationError> {
	// Simple email validation (for demo purposes only)
	if (!input.email || input.email.trim() === '') {
		return Result.fail({
			_tag: 'ValidationError',
			message: 'Email is required',
		});
	}

	if (!input.email.includes('@')) {
		return Result.fail({
			_tag: 'ValidationError',
			message: 'Invalid email format',
		});
	}

	if (!input.name || input.name.trim() === '') {
		return Result.fail({
			_tag: 'ValidationError',
			message: 'Name is required',
		});
	}

	return Result.succeed(input);
}

/**
 * Checks if a user with the given email already exists.
 * Returns ConflictError if user exists.
 */
export function checkUserExists(
	email: string,
): Result.Result<void, ConflictError> {
	// Mock: user with test@example.com already exists
	if (email === 'test@example.com') {
		return Result.fail({
			_tag: 'ConflictError',
			message: `User with email ${email} already exists`,
		});
	}

	return Result.succeed();
}

/**
 * Saves a user to the database.
 * Returns InfrastructureError on failure.
 */
export function saveUser(
	user: User,
): Result.Result<User, InfrastructureError> {
	// Mock: simulate random infrastructure failure
	const shouldFail = user.email.includes('fail');

	if (shouldFail) {
		return Result.fail({
			_tag: 'InfrastructureError',
			message: 'Failed to save user to database',
		});
	}

	return Result.succeed(user);
}

// ========================================
// Main UseCase: Register User
// ========================================

/**
 * Registers a new user by validating input, checking for conflicts,
 * and saving to the database.
 *
 * This demonstrates byethrow's Result composition using pipe.
 * The library provides a clean API for chaining operations.
 */
export function registerUser(
	input: CreateUserInput,
): Result.Result<User, AppError> {
	return Result.pipe(
		// Step 1: Validate input
		validateInput(input),
		// Step 2: Check if user exists (andThrough discards the result but keeps errors)
		Result.andThrough((validatedInput) =>
			checkUserExists(validatedInput.email),
		),
		// Step 3: Create and save user
		Result.andThen((validatedInput) => {
			const user: User = {
				id: `user-${Date.now()}`,
				email: validatedInput.email,
				name: validatedInput.name,
			};
			return saveUser(user);
		}),
	);
}

// ========================================
// Alternative: Async version
// ========================================

/**
 * Async version of registerUser showing byethrow's async support.
 * byethrow automatically handles Promise wrapping when needed.
 */
export async function registerUserAsync(
	input: CreateUserInput,
): Promise<Result.Result<User, AppError>> {
	// Simulate async operations
	const validateAsync = async (
		input: CreateUserInput,
	): Promise<Result.Result<CreateUserInput, ValidationError>> => {
		// Simulate async validation
		await new Promise((resolve) => setTimeout(resolve, 1));
		return validateInput(input);
	};

	const checkExistsAsync = async (
		email: string,
	): Promise<Result.Result<void, ConflictError>> => {
		// Simulate async check
		await new Promise((resolve) => setTimeout(resolve, 1));
		return checkUserExists(email);
	};

	const saveUserAsync = async (
		user: User,
	): Promise<Result.Result<User, InfrastructureError>> => {
		// Simulate async save
		await new Promise((resolve) => setTimeout(resolve, 1));
		return saveUser(user);
	};

	return Result.pipe(
		await validateAsync(input),
		Result.andThrough((validatedInput) => checkExistsAsync(validatedInput.email)),
		Result.andThen((validatedInput) => {
			const user: User = {
				id: `user-${Date.now()}`,
				email: validatedInput.email,
				name: validatedInput.name,
			};
			return saveUserAsync(user);
		}),
	);
}
