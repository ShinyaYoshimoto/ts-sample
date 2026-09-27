import type { Topic } from '@google-cloud/pubsub';
import type {
	RegisterUserError,
	RegisterUserInput,
	User,
	UserService,
} from '@ts-sample/user-domain';
import { type UserRegisteredEvent, createUserRegisteredEvent } from './events';

/** イベントを発行する。eventType を属性にも入れておくと、購読側で本文を読まずに振り分けられる */
export async function publishEvent(
	topic: Topic,
	event: UserRegisteredEvent,
): Promise<string> {
	return topic.publishMessage({
		json: event,
		attributes: { eventType: event.eventType },
	});
}

/**
 * ユーザーを登録し、成功したら UserRegistered イベントを発行する
 *
 * 注意: 登録（DB への保存）と発行は1つのトランザクションにならない。
 * 保存後・発行前に落ちるとイベントが失われるため、本番では Outbox パターンなどで補う（README 参照）。
 */
export async function registerUserAndPublish(
	service: UserService,
	topic: Topic,
	input: RegisterUserInput,
): Promise<
	| { ok: true; user: User; event: UserRegisteredEvent }
	| { ok: false; error: RegisterUserError }
> {
	const result = service.registerUser(input);
	if (!result.ok) return { ok: false, error: result.error };

	const event = createUserRegisteredEvent(result.value);
	await publishEvent(topic, event);
	return { ok: true, user: result.value, event };
}
