/**
 * REST 固有のテスト
 *
 * 入力と結果の対応（仕様）は ../contract.test.ts で全スタイル共通に検証する。
 * ここでは REST ならではの部分（ステータスコードごとの型の絞り込み、リクエストの形の検証、OpenAPI）を確かめる。
 */
import { testClient } from 'hono/testing';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
	EmailAlreadyExistsError,
	User,
	UserNotFoundError,
	ValidationError,
} from '../domain/user-service';
import { createApp } from './server';

describe('REST (Hono + zod-openapi)', () => {
	it('ステータスコードで分岐すると、res.json() の型がステータスごとに絞り込まれる', async () => {
		const client = testClient(createApp());
		const res = await client.users.$post({
			json: { email: 'a@example.com', name: 'A' },
		});

		if (res.status === 201) {
			expectTypeOf(await res.json()).toEqualTypeOf<User>();
		} else if (res.status === 400) {
			expectTypeOf(await res.json()).toEqualTypeOf<ValidationError>();
		} else {
			expectTypeOf(res.status).toEqualTypeOf<409>();
			expectTypeOf(await res.json()).toEqualTypeOf<EmailAlreadyExistsError>();
		}

		const found = await client.users[':id'].$get({ param: { id: 'user-1' } });
		if (found.status === 200) {
			expectTypeOf(await found.json()).toEqualTypeOf<User>();
		} else {
			expectTypeOf(found.status).toEqualTypeOf<404>();
			expectTypeOf(await found.json()).toEqualTypeOf<UserNotFoundError>();
		}
		expect(found.status).toBe(200);
	});

	it('業務エラーを HTTP ステータスに対応付ける（400 / 409 / 404）', async () => {
		const client = testClient(createApp());
		const invalid = await client.users.$post({
			json: { email: 'invalid', name: 'A' },
		});
		await client.users.$post({ json: { email: 'a@example.com', name: 'A' } });
		const duplicated = await client.users.$post({
			json: { email: 'a@example.com', name: 'A' },
		});
		const missing = await client.users[':id'].$get({
			param: { id: 'user-999' },
		});

		expect([invalid.status, duplicated.status, missing.status]).toEqual([
			400, 409, 404,
		]);
	});

	it('リクエストの形が不正（文字列でない）なら、zod の検証で 400 を返す', async () => {
		const res = await createApp().request('/users', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email: 123, name: 'A' }),
		});

		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			code: 'VALIDATION_ERROR',
			field: 'email',
		});
	});

	it('ルート定義から OpenAPI ドキュメントが生成される', async () => {
		const res = await createApp().request('/openapi.json');
		const doc = await res.json();

		expect(Object.keys(doc.paths['/users'].post.responses)).toEqual([
			'201',
			'400',
			'409',
		]);
		expect(Object.keys(doc.paths['/users/{id}'].get.responses)).toEqual([
			'200',
			'404',
		]);
		expect(Object.keys(doc.components.schemas)).toEqual(
			expect.arrayContaining([
				'RegisterUserRequest',
				'User',
				'ValidationError',
				'EmailAlreadyExistsError',
				'UserNotFoundError',
			]),
		);
	});
});
