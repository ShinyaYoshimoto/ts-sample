import { type ConnectRouter, createConnectRouter } from '@connectrpc/connect';
import { createFetchHandler } from '@connectrpc/connect/protocol';
import {
	type ApiError,
	type UserService as DomainUserService,
	createUserService,
} from '@ts-sample/user-domain';
import { UserService } from '../../generated/user/v1/user_connect.js';
import {
	ErrorDetail,
	GetUserResponse,
	RegisterUserResponse,
	User,
} from '../../generated/user/v1/user_pb.js';

/** ドメインの結果を oneof（case: 'user' | 'error'）に変換する */
function toOneof(
	result:
		| { ok: true; value: { id: string; email: string; name: string } }
		| { ok: false; error: ApiError },
) {
	return result.ok
		? { case: 'user' as const, value: new User(result.value) }
		: {
				case: 'error' as const,
				value: new ErrorDetail({
					code: result.error.code,
					message: result.error.message,
					field: 'field' in result.error ? result.error.field : undefined,
				}),
			};
}

/**
 * UserService の実装（.proto の service 定義から生成されたインターフェースを実装する）
 */
export function createRoutes(service: DomainUserService = createUserService()) {
	return (router: ConnectRouter) => {
		router.service(UserService, {
			registerUser: (req) =>
				new RegisterUserResponse({
					result: toOneof(service.registerUser(req)),
				}),
			getUser: (req) =>
				new GetUserResponse({ result: toOneof(service.getUser(req.id)) }),
		});
	};
}

/**
 * ルーターを Fetch API のハンドラーとして使う（Cloudflare Workers などと同じ方式）。
 * テストやデモでは、これをクライアントの fetch に直結して実サーバーなしで呼び出す。
 */
export function toFetch(routes: (router: ConnectRouter) => void): typeof fetch {
	const router = createConnectRouter();
	routes(router);
	const handlers = new Map(
		router.handlers.map((handler) => [
			handler.requestPath,
			createFetchHandler(handler),
		]),
	);

	return async (input, init) => {
		const request = new Request(input, init);
		const handler = handlers.get(new URL(request.url).pathname);
		return handler
			? handler(request)
			: new Response('Not Found', { status: 404 });
	};
}
