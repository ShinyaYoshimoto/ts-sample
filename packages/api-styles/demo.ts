/**
 * 比較デモ: 同じ操作を各 API スタイルで実行し、実際の HTTP のやり取りを並べて表示する
 *
 *   pnpm demo
 *
 * 結果（成功 / エラーの種類）は共通仕様テストで全スタイル同じであることを確認している。
 * ここでは、その同じ結果が「どんなリクエスト・レスポンスで表現されているか」の違いを見る。
 */
import { type Exchange, styles } from './adapters';

const scenarios = [
	{
		title: '登録（成功）',
		run: (c: ReturnType<(typeof styles)['REST']>) =>
			c.registerUser({ email: 'alice@example.com', name: 'Alice' }),
	},
	{
		title: '登録（入力エラー）',
		run: (c: ReturnType<(typeof styles)['REST']>) =>
			c.registerUser({ email: 'invalid', name: 'Alice' }),
	},
	{
		title: '登録（重複）',
		run: (c: ReturnType<(typeof styles)['REST']>) =>
			c.registerUser({ email: 'alice@example.com', name: 'Alice' }),
	},
	{
		title: '取得（成功）',
		run: (c: ReturnType<(typeof styles)['REST']>) => c.getUser('user-1'),
	},
	{
		title: '取得（存在しない）',
		run: (c: ReturnType<(typeof styles)['REST']>) => c.getUser('user-999'),
	},
];

async function main() {
	// スタイルごとに1つのクライアント（ストア）でシナリオを順に実行する
	const logs = new Map<string, Exchange[]>();
	for (const [name, createStyle] of Object.entries(styles)) {
		const exchanges: Exchange[] = [];
		logs.set(name, exchanges);
		const client = createStyle((exchange) => exchanges.push(exchange));
		for (const scenario of scenarios) {
			await scenario.run(client);
		}
	}

	scenarios.forEach((scenario, i) => {
		console.log(`\n=== ${scenario.title} ===`);
		for (const [name, exchanges] of logs) {
			const e = exchanges[i];
			console.log(`\n[${name}] ${e.method} ${e.path} -> ${e.status}`);
			// GraphQL のクエリ文字列の改行・インデントを詰めて表示する
			if (e.requestBody)
				console.log(`  request : ${e.requestBody.replace(/(\\n|\s)+/g, ' ')}`);
			console.log(`  response: ${e.responseBody}`);
		}
	});
}

main();
