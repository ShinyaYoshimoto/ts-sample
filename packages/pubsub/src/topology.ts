import type { PubSub, Subscription, Topic } from '@google-cloud/pubsub';
import type { ResourceNames } from './config';
import topology from './topology.json';

/** Dead Letter に送るまでの配信回数（Pub/Sub の最小値は 5）。値は Terraform と共通の topology.json にある */
export const MAX_DELIVERY_ATTEMPTS = topology.maxDeliveryAttempts;

/** 確認期限（秒）。これを過ぎても ack / nack がなければ再配信される */
const ACK_DEADLINE_SECONDS = topology.ackDeadlineSeconds;

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
 * エミュレーター向け。本物の GCP では terraform/ で同じ構成を作る（IAM も含めて管理できるため）。
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
			ackDeadlineSeconds: ACK_DEADLINE_SECONDS,
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
				ackDeadlineSeconds: ACK_DEADLINE_SECONDS,
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
