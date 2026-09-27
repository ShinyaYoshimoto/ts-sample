/**
 * Connect (gRPC) 固有のテスト
 *
 * 入力と結果の対応（仕様）は ../contract.test.ts で全スタイル共通に検証する。
 * ここでは Connect ならではの部分（oneof の case による絞り込み、
 * NO_SIDE_EFFECTS のクエリが HTTP GET になること）を確かめる。
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ErrorDetail, User } from './generated/user/v1/user_pb.js';
import { createClient, createTransport } from './src/client/user-client.js';
import { createRoutes, toFetch } from './src/server/user-service.js';

function setup() {
	const requests: { method: string; path: string }[] = [];
	const handler = toFetch(createRoutes());
	const fetchFn: typeof fetch = async (input, init) => {
		const request = new Request(input, init);
		requests.push({
			method: request.method,
			path: new URL(request.url).pathname,
		});
		return handler(request);
	};
	const client = createClient(
		createTransport('http://localhost', { fetch: fetchFn }),
	);
	return { client, requests };
}

describe('Connect (gRPC)', () => {
	it('oneof の case で分岐すると、value の型が絞り込まれる', async () => {
		const { client } = setup();
		const res = await client.registerUser({
			email: 'a@example.com',
			name: 'A',
		});

		switch (res.result.case) {
			case 'user':
				expectTypeOf(res.result.value).toEqualTypeOf<User>();
				break;
			case 'error':
				expectTypeOf(res.result.value).toEqualTypeOf<ErrorDetail>();
				break;
			default:
				// oneof が未設定の場合もあり得るのが Protobuf の特徴
				expectTypeOf(res.result.case).toEqualTypeOf<undefined>();
		}
		expect(res.result.case).toBe('user');
	});

	it('NO_SIDE_EFFECTS のクエリは HTTP GET、コマンドは POST で送られる', async () => {
		const { client, requests } = setup();
		await client.registerUser({ email: 'a@example.com', name: 'A' });
		await client.getUser({ id: 'user-1' });

		expect(requests).toEqual([
			{ method: 'POST', path: '/user.v1.UserService/RegisterUser' },
			{ method: 'GET', path: '/user.v1.UserService/GetUser' },
		]);
	});

	it('ErrorDetail.field は optional で、入力エラーのときだけ設定される', async () => {
		const { client } = setup();
		const invalid = await client.registerUser({ email: 'invalid', name: 'A' });
		const missing = await client.getUser({ id: 'user-999' });

		expect(invalid.result.case === 'error' && invalid.result.value.field).toBe(
			'email',
		);
		expect(
			missing.result.case === 'error' && missing.result.value.field,
		).toBeUndefined();
	});
});
