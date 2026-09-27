/**
 * トピックとサブスクリプションを作る
 *
 *   PUBSUB_EMULATOR_HOST=localhost:8085 PUSH_ENDPOINT=http://localhost:8080/pubsub/push pnpm setup:topology
 *
 * PUSH_ENDPOINT を省略すると Push 型サブスクリプションは作らない。
 */
import { PubSub } from '@google-cloud/pubsub';
import { config, resourceNames } from '../config';
import { ensureTopology } from '../topology';

async function main() {
	const pubsub = new PubSub({ projectId: config.projectId });
	const names = resourceNames();
	await ensureTopology(pubsub, names, {
		pushEndpoint: config.pushEndpoint,
		pushAuthServiceAccount: config.pushAuthServiceAccount,
	});
	console.log(
		`Project: ${config.projectId}${process.env.PUBSUB_EMULATOR_HOST ? ' (emulator)' : ''}`,
	);
	console.log(names);
	if (!config.pushEndpoint)
		console.log(
			'PUSH_ENDPOINT が未設定のため、Push 型サブスクリプションは作成していません',
		);
}

main();
