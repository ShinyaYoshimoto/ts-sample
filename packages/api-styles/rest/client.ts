import { hc } from 'hono/client';
import type { AppType } from './server';

/**
 * REST クライアント
 *
 * サーバーの AppType を渡すだけで、パス・リクエスト・レスポンスの型が付く（コード生成なし）。
 * レスポンスの型は HTTP ステータスごとに決まっているため、
 * `res.status` で分岐すると `res.json()` の型が自動で絞り込まれる。
 */
export function createClient(
	baseUrl: string,
	options?: { fetch?: typeof fetch },
) {
	return hc<AppType>(baseUrl, options);
}

export type Client = ReturnType<typeof createClient>;

export async function registerUser(
	client: Client,
	input: { email: string; name: string },
) {
	const res = await client.users.$post({ json: input });

	switch (res.status) {
		case 201:
			return { ok: true as const, user: await res.json() }; // User 型
		case 400:
			return { ok: false as const, error: await res.json() }; // ValidationError 型
		case 409:
			return { ok: false as const, error: await res.json() }; // EmailAlreadyExistsError 型
		default: {
			// 宣言していないステータスが増えたらコンパイルエラーになる
			const unexpected: never = res;
			throw new Error(`Unexpected response: ${unexpected}`);
		}
	}
}

export async function getUser(client: Client, id: string) {
	const res = await client.users[':id'].$get({ param: { id } });

	switch (res.status) {
		case 200:
			return { ok: true as const, user: await res.json() }; // User 型
		case 404:
			return { ok: false as const, error: await res.json() }; // UserNotFoundError 型
		default: {
			const unexpected: never = res;
			throw new Error(`Unexpected response: ${unexpected}`);
		}
	}
}
