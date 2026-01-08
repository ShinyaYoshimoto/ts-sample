/**
 * sample-trpc: tRPC client-server result propagation sample
 * 
 * This module demonstrates how to use tRPC with a custom Result type
 * (Discriminated Union) that seamlessly propagates from server to client
 * with full type safety and type narrowing support.
 */

// Export Result type and helpers
export { type Result, type Success, type Failure, success, failure } from './result';

// Export domain types
export { type User, type AppError } from './types';

// Export server components
export { appRouter, type AppRouter, router, publicProcedure } from './server';

// Export client components
export { createClient, type Client } from './client';
