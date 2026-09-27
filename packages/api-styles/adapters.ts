/**
 * 各 API スタイルのクライアントを、共通の形（StyleClient）に揃えるアダプタ
 *
 * どのスタイルも「サーバー（Fetch API のハンドラー）」と「そのスタイルの正式なクライアント」を
 * fetch で直結しているため、実サーバーを立てずに、実際のシリアライズと HTTP の意味論（メソッド・ステータス）を通る。
 * 共通仕様テスト（contract.test.ts）と比較デモ（demo.ts）で使う。
 */
import {
	createClient as createConnectClient,
	createTransport,
} from './connect-rpc/src/client/user-client.js';
import {
	toFetch as connectToFetch,
	createRoutes,
} from './connect-rpc/src/server/user-service.js';
import { createUserService } from '@ts-sample/user-domain';
import {
	createGraphQLApp,
	toFetch as graphqlToFetch,
} from './graphql-union/src/app';
import { createClient as createGraphQLClient } from './graphql-union/src/client';
import * as rest from './rest/client';
import { createApp } from './rest/server';
import { createClient as createTRPCClient } from './trpc/client';
import { createFetchHandler } from './trpc/fetch-handler';
import { createAppRouter } from './trpc/server';

export type User = { id: string; email: string; name: string };
export type ErrorOutcome = { code: string; message: string; field?: string };
export type Outcome =
	| { ok: true; user: User }
	| { ok: false; error: ErrorOutcome };

export interface StyleClient {
	registerUser(input: { email: string; name: string }): Promise<Outcome>;
	getUser(id: string): Promise<Outcome>;
}

/** HTTP のやり取り（デモで各スタイルの違いを見せるために記録する） */
export type Exchange = {
	method: string;
	path: string;
	status: number;
	requestBody?: string;
	responseBody: string;
};
export type Observer = (exchange: Exchange) => void;

/** fetch をラップして、やり取りを observer に渡す */
function observe(fetchFn: typeof fetch, observer?: Observer): typeof fetch {
	if (!observer) return fetchFn;
	return async (input, init) => {
		const request = new Request(input, init);
		const requestBody =
			request.method === 'GET' ? undefined : await request.clone().text();
		const response = await fetchFn(request);
		const url = new URL(request.url);
		observer({
			method: request.method,
			path: decodeURIComponent(url.pathname + url.search),
			status: response.status,
			requestBody,
			responseBody: await response.clone().text(),
		});
		return response;
	};
}

const toUser = (user: User): User => ({
	id: user.id,
	email: user.email,
	name: user.name,
});

const toError = (error: {
	code: string;
	message: string;
	field?: string;
}): ErrorOutcome =>
	error.field === undefined
		? { code: error.code, message: error.message }
		: { code: error.code, message: error.message, field: error.field };

/** REST: HTTP ステータスで分岐した結果を揃える */
function createRestStyle(observer?: Observer): StyleClient {
	const app = createApp(createUserService());
	const client = rest.createClient('http://localhost', {
		fetch: observe(async (input, init) => app.request(input, init), observer),
	});
	const toOutcome = (
		result: { ok: true; user: User } | { ok: false; error: ErrorOutcome },
	): Outcome =>
		result.ok
			? { ok: true, user: toUser(result.user) }
			: { ok: false, error: toError(result.error) };

	return {
		registerUser: async (input) =>
			toOutcome(await rest.registerUser(client, input)),
		getUser: async (id) => toOutcome(await rest.getUser(client, id)),
	};
}

/** tRPC: Result（status: 'ok' | 'error'）を揃える */
function createTRPCStyle(observer?: Observer): StyleClient {
	const client = createTRPCClient('http://localhost/trpc', {
		fetch: observe(
			createFetchHandler(createAppRouter(createUserService())),
			observer,
		),
	});
	const toOutcome = (
		result:
			| { status: 'ok'; data: User }
			| { status: 'error'; error: ErrorOutcome },
	): Outcome =>
		result.status === 'ok'
			? { ok: true, user: toUser(result.data) }
			: { ok: false, error: toError(result.error) };

	return {
		registerUser: async (input) =>
			toOutcome(await client.registerUser.mutate(input)),
		getUser: async (id) => toOutcome(await client.getUser.query({ id })),
	};
}

/** GraphQL: Union（__typename）を揃える */
function createGraphQLStyle(observer?: Observer): StyleClient {
	const client = createGraphQLClient('http://localhost/graphql', {
		fetch: observe(
			graphqlToFetch(createGraphQLApp(createUserService())),
			observer,
		),
	});
	const toOutcome = (
		result:
			| ({ __typename: 'User' } & User)
			| ({ __typename: string } & ErrorOutcome),
	): Outcome =>
		result.__typename === 'User'
			? { ok: true, user: toUser(result as User) }
			: { ok: false, error: toError(result as ErrorOutcome) };

	return {
		registerUser: async (input) => toOutcome(await client.registerUser(input)),
		getUser: async (id) => toOutcome(await client.getUser(id)),
	};
}

/** Connect: oneof（case: 'user' | 'error'）を揃える */
function createConnectStyle(observer?: Observer): StyleClient {
	const client = createConnectClient(
		createTransport('http://localhost', {
			fetch: observe(
				connectToFetch(createRoutes(createUserService())),
				observer,
			),
		}),
	);
	const toOutcome = (response: {
		result:
			| { case: 'user'; value: User }
			| { case: 'error'; value: ErrorOutcome }
			| { case: undefined };
	}): Outcome => {
		switch (response.result.case) {
			case 'user':
				return { ok: true, user: toUser(response.result.value) };
			case 'error':
				return { ok: false, error: toError(response.result.value) };
			default:
				throw new Error('oneof result is not set');
		}
	};

	return {
		registerUser: async (input) => toOutcome(await client.registerUser(input)),
		getUser: async (id) => toOutcome(await client.getUser({ id })),
	};
}

/** スタイルごとに、独立したストアを持つクライアントを作る */
export const styles = {
	REST: createRestStyle,
	tRPC: createTRPCStyle,
	GraphQL: createGraphQLStyle,
	Connect: createConnectStyle,
} satisfies Record<string, (observer?: Observer) => StyleClient>;
