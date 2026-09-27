/**
 * ユーザーを登録して UserRegistered イベントを発行する
 *
 *   PUBSUB_EMULATOR_HOST=localhost:8085 pnpm register alice@example.com Alice
 */
import { PubSub } from '@google-cloud/pubsub';
import { createUserService } from '@ts-sample/user-domain';
import { config, resourceNames } from '../config';
import { registerUserAndPublish } from '../publisher';

async function main() {
	const [email = 'alice@example.com', name = 'Alice'] = process.argv.slice(2);
	const pubsub = new PubSub({ projectId: config.projectId });
	const topic = pubsub.topic(resourceNames().topic);

	const result = await registerUserAndPublish(createUserService(), topic, {
		email,
		name,
	});
	console.log(
		result.ok ? { published: result.event } : { rejected: result.error },
	);
	await pubsub.close();
}

main();
