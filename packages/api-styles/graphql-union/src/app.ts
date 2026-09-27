import { makeExecutableSchema } from '@graphql-tools/schema';
import { createYoga } from 'graphql-yoga';
import { type UserService, createUserService } from '../../domain/user-service';
import { createResolvers } from './resolvers';
import { typeDefs } from './schema';

/**
 * GraphQL サーバー（Yoga）を作る。Yoga は Fetch API の Request を処理できるため、
 * テストやデモでは yoga.fetch をクライアントに直結して実サーバーなしで呼び出す。
 */
export function createGraphQLApp(service: UserService = createUserService()) {
	const schema = makeExecutableSchema({
		typeDefs,
		resolvers: createResolvers(service),
	});
	return createYoga({ schema, logging: false });
}

/**
 * Yoga を fetch 互換の関数として使う（クライアントの fetch に直結するため）。
 * Yoga 3 が返すのは互換実装（ponyfill）の Response なので、標準の Response に詰め替えて返す。
 */
export function toFetch(
	yoga: ReturnType<typeof createGraphQLApp>,
): typeof fetch {
	return async (input, init) => {
		const res = await yoga.fetch(new Request(input, init));
		return new Response(await res.text(), {
			status: res.status,
			headers: res.headers,
		});
	};
}
