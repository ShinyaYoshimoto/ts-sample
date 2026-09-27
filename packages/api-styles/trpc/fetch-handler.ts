import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { AppRouter } from './server';

/**
 * Fetch API の Request を tRPC ルーターで処理する（Cloudflare Workers や Hono などと同じ方式）。
 * テストやデモでは、これをクライアントの fetch に直結して実サーバーなしで呼び出す。
 */
export function createFetchHandler(router: AppRouter, endpoint = '/trpc') {
	return (input: RequestInfo | URL, init?: RequestInit) =>
		fetchRequestHandler({
			endpoint,
			req: new Request(input, init),
			router,
			createContext: () => ({}),
		});
}
