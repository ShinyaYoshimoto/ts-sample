import type { Administrator } from '../../domain/model/administrator';
import type { Order } from '../../domain/model/order';

export class OrderConfirmationCommand {
	constructor(
		public readonly order: Order,
		public readonly administrator: Administrator,
	) {}
}
