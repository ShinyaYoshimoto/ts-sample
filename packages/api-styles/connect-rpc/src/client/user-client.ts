import {
	type PromiseClient,
	type Transport,
	createPromiseClient,
} from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { UserService } from '../../generated/user/v1/user_connect.js';

/**
 * Connect クライアント
 *
 * .proto から生成したサービス定義を使うため、メソッド名・リクエスト・レスポンスに型が付く。
 * useHttpGet を有効にすると、.proto で NO_SIDE_EFFECTS を付けた GetUser は HTTP GET で送られる。
 */
export function createClient(
	transport: Transport,
): PromiseClient<typeof UserService> {
	return createPromiseClient(UserService, transport);
}

export type Client = ReturnType<typeof createClient>;

/** Connect プロトコル（HTTP + JSON）のトランスポートを作る。fetch を差し替えられる */
export function createTransport(
	baseUrl: string,
	options?: { fetch?: typeof fetch },
): Transport {
	return createConnectTransport({
		baseUrl,
		useHttpGet: true,
		fetch: options?.fetch,
	});
}
