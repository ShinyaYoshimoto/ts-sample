/**
 * tRPC 固有のテスト
 *
 * 入力と結果の対応（仕様）は ../contract.test.ts で全スタイル共通に検証する。
 * ここでは tRPC ならではの部分（型の共有と絞り込み、query / mutation の違い、
 * 業務エラーと TRPCError の境界）を確かめる。
 */
import { TRPCClientError } from '@trpc/client';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createClient } from './client';
import { createFetchHandler } from './fetch-handler';
import { type AppRouter, createAppRouter } from './server';
import type { GetUserError, RegisterUserError, User } from './types';

function setup() {
	const requests: { method: string; path: string }[] = [];
	const handler = createFetchHandler(createAppRouter());
	const client = createClient('http://localhost/trpc', {
		fetch: async (input, init) => {
			const url = new URL(
				input instanceof Request ? input.url : input.toString(),
			);
			requests.push({ method: init?.method ?? 'GET', path: url.pathname });
			return handler(input, init);
		},
	});
	return { client, requests };
}

describe('tRPC', () => {
	it('サーバーの型がクライアントに伝わり、status で型が絞り込まれる', async () => {
		const { client } = setup();
		const result = await client.registerUser.mutate({
			email: 'a@example.com',
			name: 'A',
		});

		if (result.status === 'ok') {
			expectTypeOf(result.data).toEqualTypeOf<User>();
		} else {
			expectTypeOf(result.error).toEqualTypeOf<RegisterUserError>();
		}

		const found = await client.getUser.query({ id: 'user-1' });
		if (found.status === 'error') {
			expectTypeOf(found.error).toEqualTypeOf<GetUserError>();
		}
		expect(found.status).toBe('ok');
	});

	it('クエリは GET、コマンドは POST で送られる', async () => {
		const { client, requests } = setup();
		await client.registerUser.mutate({ email: 'a@example.com', name: 'A' });
		await client.getUser.query({ id: 'user-1' });

		expect(requests).toEqual([
			{ method: 'POST', path: '/trpc/registerUser' },
			{ method: 'GET', path: '/trpc/getUser' },
		]);
	});

	it('業務エラーは Result で返り、入力の形が不正な場合だけ TRPCError（BAD_REQUEST）になる', async () => {
		const { client } = setup();

		// 業務エラー: 例外にならず、Result の error として返る
		const invalid = await client.registerUser.mutate({
			email: 'invalid',
			name: 'A',
		});
		expect(invalid.status).toBe('error');

		// 入力の形が不正: zod の検証で弾かれ、tRPC の標準エラーとして throw される
		const error = await client.registerUser
			// @ts-expect-error email に数値を渡す（型でも弾かれることの確認を兼ねる）
			.mutate({ email: 123, name: 'A' })
			.catch((e: unknown) => e);
		expect(error).toBeInstanceOf(TRPCClientError);
		expect((error as TRPCClientError<AppRouter>).data?.code).toBe(
			'BAD_REQUEST',
		);
	});
});
