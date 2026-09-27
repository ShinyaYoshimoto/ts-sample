import type { PubSub, Subscription, Topic } from '@google-cloud/pubsub';
import type { ResourceNames } from './config';

/** Dead Letter に送るまでの配信回数（Pub/Sub の最小値は 5） */
export const MAX_DELIVERY_ATTEMPTS = 5;

async function ensureTopic(pubsub: PubSub, name: string): Promise<Topic> {
	const topic = pubsub.topic(name);
	const [exists] = await topic.exists();
	if (!exists) await topic.create();
	return topic;
}

async function ensureSubscription(
	topic: Topic,
	name: string,
	options: Parameters<Topic['createSubscription']>[1],
): Promise<Subscription> {
	const subscription = topic.subscription(name);
	const [exists] = await subscription.exists();
	if (!exists) await topic.createSubscription(name, options);
	return subscription;
}

/**
 * トピックとサブスクリプションを作る（既にあれば何もしない）
 *
 * user-events ──┬─▶ welcome-mail（Pull 型）  ─┐
 *               └─▶ search-index（Push 型）  ─┴─ 5回失敗したら ▶ user-events-dead-letter
 *
 * 本物の GCP で Dead Letter を使うには、Pub/Sub のサービスエージェントへの IAM 付与も必要（README 参照）。
 */
export async function ensureTopology(
	pubsub: PubSub,
	names: ResourceNames,
	options: { pushEndpoint?: string; pushAuthServiceAccount?: string } = {},
) {
	const topic = await ensureTopic(pubsub, names.topic);
	const deadLetterTopic = await ensureTopic(pubsub, names.deadLetterTopic);
	const deadLetterPolicy = {
		deadLetterTopic: deadLetterTopic.name,
		maxDeliveryAttempts: MAX_DELIVERY_ATTEMPTS,
	};

	const welcomeMail = await ensureSubscription(
		topic,
		names.welcomeMailSubscription,
		{
			ackDeadlineSeconds: 10,
			deadLetterPolicy,
		},
	);
	const searchIndex = options.pushEndpoint
		? await ensureSubscription(topic, names.searchIndexSubscription, {
				pushConfig: {
					pushEndpoint: options.pushEndpoint,
					// 指定すると、Pub/Sub がこのサービスアカウントの OIDC トークンを Authorization ヘッダーに付けて配信する
					oidcToken: options.pushAuthServiceAccount
						? { serviceAccountEmail: options.pushAuthServiceAccount }
						: undefined,
				},
				ackDeadlineSeconds: 10,
				deadLetterPolicy,
			})
		: undefined;
	const deadLetter = await ensureSubscription(
		deadLetterTopic,
		names.deadLetterSubscription,
		{},
	);

	return { topic, deadLetterTopic, welcomeMail, searchIndex, deadLetter };
}
