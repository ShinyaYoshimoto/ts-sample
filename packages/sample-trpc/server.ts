import { initTRPC } from '@trpc/server';
import { randomUUID } from 'node:crypto';
import { failure, success, type Result } from './result';
import type { AppError, User } from './types';

/**
 * Initialize tRPC
 */
const t = initTRPC.create();

/**
 * Export router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * In-memory user store for demonstration
 */
const users: User[] = [];

/**
 * Input type for user registration
 */
type RegisterUserInput = {
	name: string;
	email: string;
};

/**
 * App Router with registerUser mutation
 */
export const appRouter = router({
	registerUser: publicProcedure
		.input((input: unknown): RegisterUserInput => {
			// Basic type check - tRPC will handle this gracefully
			if (
				typeof input !== 'object' ||
				input === null ||
				!('name' in input) ||
				!('email' in input)
			) {
				// Return a minimal valid object that will be caught by validation
				return { name: '', email: '' };
			}
			return input as RegisterUserInput;
		})
		.mutation(
			async ({ input }): Promise<Result<User, AppError>> => {
				// Validation
				if (!input.name || input.name.length < 2) {
					return failure({
						type: 'VALIDATION_ERROR',
						message: 'Name must be at least 2 characters',
					});
				}

				if (!input.email || !input.email.includes('@')) {
					return failure({
						type: 'VALIDATION_ERROR',
						message: 'Invalid email format',
					});
				}

				// Check for duplicate email
				const existingUser = users.find((u) => u.email === input.email);
				if (existingUser) {
					return failure({
						type: 'DUPLICATE_EMAIL',
						email: input.email,
					});
				}

				// Create new user
				const newUser: User = {
					id: randomUUID(),
					name: input.name,
					email: input.email,
				};

				users.push(newUser);

				return success(newUser);
			}
		),
});

/**
 * Export type definition for the router
 */
export type AppRouter = typeof appRouter;
