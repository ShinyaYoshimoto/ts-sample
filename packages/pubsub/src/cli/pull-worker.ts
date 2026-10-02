/**
 * Pull 型の購読（ウェルカムメール送信）を起動する
 *
 *   PUBSUB_EMULATOR_HOST=localhost:8085 pnpm start:pull
 */
import { PubSub } from '@google-cloud/pubsub';
import { config, resourceNames } from '../config';
import {
	FakeMailer,
	InMemoryProcessedEventStore,
	createWelcomeMailHandler,
} from '../consumers/welcome-mail';
import { startPullSubscriber } from '../pull-subscriber';

const pubsub = new PubSub({ projectId: config.projectId });
const mailer = new FakeMailer();
const handler = createWelcomeMailHandler({
	mailer,
	processed: new InMemoryProcessedEventStore(),
});

const subscription = pubsub.subscription(
	resourceNames().welcomeMailSubscription,
	{
		flowControl: { maxMessages: 10 },
	},
);
const subscriber = startPullSubscriber(subscription, async (event) => {
	const result = await handler(event);
	console.log(`[welcome-mail] ${result}: ${event.data.user.email}`);
	return result;
});

console.log(`Pulling from ${subscription.name} ...（Ctrl+C で終了）`);
process.on('SIGINT', async () => {
	await subscriber.close();
	process.exit(0);
});
