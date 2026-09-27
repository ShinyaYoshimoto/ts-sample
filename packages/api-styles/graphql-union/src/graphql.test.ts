/**
 * GraphQL 固有のテスト
 *
 * 入力と結果の対応（仕様）は ../../contract.test.ts で全スタイル共通に検証する。
 * ここでは GraphQL ならではの部分（__typename による絞り込み、フィールド選択、
 * 業務エラーとスキーマ違反の違い）を確かめる。
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createGraphQLApp, toFetch } from './app';
import {
	type EmailAlreadyExistsError,
	type User,
	type ValidationError,
	createClient,
} from './client';

function setup() {
	const fetchFn = toFetch(createGraphQLApp());
	return {
		fetchFn,
		client: createClient('http://localhost/graphql', { fetch: fetchFn }),
	};
}

describe('GraphQL (Union)', () => {
	it('__typename で分岐すると、Union のメンバーごとに型が絞り込まれる', async () => {
		const { client } = setup();
		const result = await client.registerUser({
			email: 'a@example.com',
			name: 'A',
		});

		switch (result.__typename) {
			case 'User':
				expectTypeOf(result).toEqualTypeOf<User>();
				break;
			case 'ValidationError':
				expectTypeOf(result).toEqualTypeOf<ValidationError>();
				break;
			case 'EmailAlreadyExistsError':
				expectTypeOf(result).toEqualTypeOf<EmailAlreadyExistsError>();
				break;
			default:
				expectTypeOf(result).toBeNever();
		}
		expect(result.__typename).toBe('User');
	});

	it('クライアントが選んだフィールドだけが返る', async () => {
		const { fetchFn, client } = setup();
		await client.registerUser({ email: 'a@example.com', name: 'A' });

		const res = await fetchFn('http://localhost/graphql', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				query: '{ user(id: "user-1") { ... on User { name } } }',
			}),
		});

		expect(await res.json()).toEqual({ data: { user: { name: 'A' } } });
	});

	it('業務エラーは data の Union で返り、スキーマ違反は errors で返る', async () => {
		const { fetchFn } = setup();
		const post = (query: string) =>
			fetchFn('http://localhost/graphql', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ query }),
			}).then((res) => res.json());

		// 業務エラー: 通常の data として返る
		expect(
			await post(
				'{ user(id: "user-999") { __typename ... on AppError { code } } }',
			),
		).toEqual({
			data: {
				user: { __typename: 'UserNotFoundError', code: 'USER_NOT_FOUND' },
			},
		});

		// スキーマ違反（必須の引数がない）: data はなく errors に入る
		const invalid = await post('{ user { __typename } }');
		expect(invalid.data).toBeUndefined();
		expect(invalid.errors).toHaveLength(1);
	});
});
