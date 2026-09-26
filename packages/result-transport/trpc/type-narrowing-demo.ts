/**
 * Type Narrowing Demonstration
 * 
 * This file demonstrates how TypeScript's type narrowing works with the Result type
 * when using tRPC client-server communication.
 * 
 * Run this file with: pnpm tsx type-narrowing-demo.ts
 */

import { appRouter } from './server';
import type { User, AppError } from './types';
import type { Result } from './result';

/**
 * Create a caller to simulate client-server communication
 */
const caller = appRouter.createCaller({});

/**
 * Demonstration of type narrowing with Result type
 */
async function demonstrateTypeNarrowing() {
	console.log('=== tRPC Result Type Narrowing Demonstration ===\n');

	// Example 1: Success case
	console.log('1. Success Case:');
	const successResult = await caller.registerUser({
		name: 'Alice Smith',
		email: 'alice@example.com',
	});

	// TypeScript knows this is Result<User, AppError>
	const result1: Result<User, AppError> = successResult;

	// After checking status, TypeScript narrows the type
	if (result1.status === 'ok') {
		// Here, TypeScript knows result1 is Success<User>
		// result1.data is typed as User and has full autocomplete
		console.log(`✓ User registered: ${result1.data.name} (${result1.data.email})`);
		console.log(`  User ID: ${result1.data.id}`);
		
		// This would be a TypeScript error (uncomment to see):
		// console.log(result1.error); // Property 'error' does not exist on Success<User>
	}

	console.log('\n2. Validation Error Case:');
	const validationResult = await caller.registerUser({
		name: 'B',
		email: 'bob@example.com',
	});

	if (validationResult.status === 'error') {
		// Here, TypeScript knows validationResult is Failure<AppError>
		// validationResult.error is typed as AppError with full autocomplete
		console.log(`✗ Validation failed: ${validationResult.error.type}`);
		
		// We can further narrow the AppError type
		if (validationResult.error.type === 'VALIDATION_ERROR') {
			console.log(`  Message: ${validationResult.error.message}`);
		}
		
		// This would be a TypeScript error (uncomment to see):
		// console.log(validationResult.data); // Property 'data' does not exist on Failure<AppError>
	}

	console.log('\n3. Duplicate Email Error Case:');
	// Try to register with Alice's email again
	const duplicateResult = await caller.registerUser({
		name: 'Alice Clone',
		email: 'alice@example.com',
	});

	if (duplicateResult.status === 'error') {
		console.log(`✗ Registration failed: ${duplicateResult.error.type}`);
		
		// TypeScript knows which error fields are available based on the type
		if (duplicateResult.error.type === 'DUPLICATE_EMAIL') {
			console.log(`  Email already registered: ${duplicateResult.error.email}`);
		}
	}

	console.log('\n4. Pattern Matching Style:');
	const result4 = await caller.registerUser({
		name: 'Charlie Brown',
		email: 'charlie@example.com',
	});

	// Clean pattern matching style
	const message = result4.status === 'ok'
		? `Welcome, ${result4.data.name}! Your ID is ${result4.data.id}`
		: `Error: ${result4.error.type}`;
	
	console.log(`  ${message}`);

	console.log('\n5. Exhaustive Error Handling:');
	const result5 = await caller.registerUser({
		name: '',
		email: 'invalid',
	});

	if (result5.status === 'error') {
		// TypeScript ensures we handle all error types
		switch (result5.error.type) {
			case 'VALIDATION_ERROR':
				console.log(`  Validation: ${result5.error.message}`);
				break;
			case 'DUPLICATE_EMAIL':
				console.log(`  Duplicate: ${result5.error.email}`);
				break;
			case 'DATABASE_ERROR':
				console.log(`  Database: ${result5.error.message}`);
				break;
			// TypeScript would error if we missed a case
		}
	}

	console.log('\n=== Demonstration Complete ===');
	console.log('\nKey Takeaways:');
	console.log('✓ Type narrowing works seamlessly with discriminated unions');
	console.log('✓ Full IntelliSense/autocomplete support in both success and error cases');
	console.log('✓ Compile-time safety prevents accessing wrong fields');
	console.log('✓ No runtime overhead - this is pure TypeScript type checking');
}

// Run the demonstration
demonstrateTypeNarrowing().catch(console.error);
