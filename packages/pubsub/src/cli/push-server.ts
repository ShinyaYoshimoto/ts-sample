/**
 * Push 型の購読（検索インデックス更新）を受ける HTTP サーバーを起動する
 *
 *   pnpm start:push   # http://localhost:8080/pubsub/push（PORT で変更可。Cloud Run では PORT が渡される）
 */
import { serve } from '@hono/node-server';
import { config } from '../config';
import {
	InMemorySearchIndex,
	createSearchIndexHandler,
} from '../consumers/search-index';
import { createPushApp } from '../push-app';

const index = new InMemorySearchIndex();
const handler = createSearchIndexHandler({ index });

const app = createPushApp(async (event) => {
	const result = await handler(event);
	console.log(
		`[search-index] ${result}: ${event.data.user.id} (${index.documents.size} documents)`,
	);
	return result;
});

serve({ fetch: app.fetch, port: config.port }, () => {
	console.log(`Push endpoint: http://localhost:${config.port}/pubsub/push`);
});
