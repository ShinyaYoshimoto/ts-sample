import { hc } from 'hono/client';
import { testClient } from 'hono/testing';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { registerUser } from './client';
import type { ConflictError, User, ValidationError } from './schema';
import { type AppType, createApp } from './server';

describe('REST (Hono + zod-openapi)', () => {
	describe('POST /users', () => {
		it('正しい入力なら 201 と User を返す', async () => {
			const client = testClient(createApp());
			const res = await client.users.$post({
				json: { email: 'alice@example.com', name: 'Alice' },
			});

			expect(res.status).toBe(201);
			if (res.status === 201) {
				const user = await res.json();
				expectTypeOf(user).toEqualTypeOf<User>();
				expect(user).toEqual({
					id: 'user-1',
					email: 'alice@example.com',
					name: 'Alice',
				});
			}
		});

		it.each([
			{
				case: 'メールアドレスの形式が不正',
				email: 'invalid',
				name: 'Alice',
				field: 'email',
				message: 'Invalid email format',
			},
			{
				case: '名前が空',
				email: 'alice@example.com',
				name: '',
				field: 'name',
				message: 'Name is required',
			},
		])(
			'$case なら 400 と ValidationError を返す',
			async ({ email, name, field, message }) => {
				const client = testClient(createApp());
				const res = await client.users.$post({ json: { email, name } });

				expect(res.status).toBe(400);
				if (res.status === 400) {
					const error = await res.json();
					expectTypeOf(error).toEqualTypeOf<ValidationError>();
					expect(error).toEqual({ type: 'VALIDATION_ERROR', message, field });
				}
			},
		);

		it('登録済みのメールアドレスなら 409 と ConflictError を返す', async () => {
			const client = testClient(createApp());
			await client.users.$post({
				json: { email: 'alice@example.com', name: 'Alice' },
			});
			const res = await client.users.$post({
				json: { email: 'alice@example.com', name: 'Alice 2' },
			});

			expect(res.status).toBe(409);
			if (res.status === 409) {
				const error = await res.json();
				expectTypeOf(error).toEqualTypeOf<ConflictError>();
				expect(error.type).toBe('DUPLICATE_EMAIL');
				expect(error.email).toBe('alice@example.com');
			}
		});
	});

	describe('クライアント（hc）からの呼び出し', () => {
		// 実サーバーを立てずに、hc の fetch をアプリに直接つなぐ
		const createClient = () => {
			const app = createApp();
			return hc<AppType>('http://localhost', {
				fetch: (input: RequestInfo | URL, init?: RequestInit) =>
					app.request(input, init),
			});
		};

		it('ステータスで分岐した結果を Result 風の形に変換できる', async () => {
			const client = createClient();
			expect(
				await registerUser(client, { email: 'bob@example.com', name: 'Bob' }),
			).toEqual({
				ok: true,
				user: { id: 'user-1', email: 'bob@example.com', name: 'Bob' },
			});

			const duplicated = await registerUser(client, {
				email: 'bob@example.com',
				name: 'Bob',
			});
			expect(duplicated.ok).toBe(false);
			if (!duplicated.ok) {
				expect(duplicated.error.type).toBe('DUPLICATE_EMAIL');
			}
		});
	});

	describe('OpenAPI ドキュメント', () => {
		it('ルート定義から /users のスキーマとレスポンスが生成される', async () => {
			const res = await createApp().request('/openapi.json');
			const doc = await res.json();

			expect(Object.keys(doc.paths['/users'].post.responses)).toEqual([
				'201',
				'400',
				'409',
			]);
			expect(Object.keys(doc.components.schemas)).toEqual(
				expect.arrayContaining([
					'RegisterUserRequest',
					'User',
					'ValidationError',
					'ConflictError',
				]),
			);
		});
	});
});
