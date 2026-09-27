import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';

/**
 * tRPC クライアント
 *
 * サーバーの AppRouter 型を渡すだけで、手続き名・入力・出力の型が付く（コード生成なし）。
 * `fetch` を差し替えると、実サーバーを立てずにテストやデモから呼び出せる。
 */
export function createClient(url: string, options?: { fetch?: typeof fetch }) {
	return createTRPCClient<AppRouter>({
		links: [httpBatchLink({ url, fetch: options?.fetch })],
	});
}

export type Client = ReturnType<typeof createClient>;
