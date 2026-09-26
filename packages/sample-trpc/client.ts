import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';

/**
 * Create a tRPC client with type inference from AppRouter
 * 
 * In a real application, this would connect to an actual HTTP endpoint.
 * For testing purposes, we'll create a test client that directly calls the router.
 */
export function createClient(url: string) {
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url,
			}),
		],
	});
}

/**
 * Type-safe client type inferred from AppRouter
 */
export type Client = ReturnType<typeof createClient>;
