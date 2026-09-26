import type { Administrator } from '../../domain/model/administrator';
import type { Order } from '../../domain/model/order';
import type { OrderConfirmation } from '../../domain/model/orderConfirmation';

export interface ConfirmOrderPort {
	confirmOrder(
		order: Order,
		administrator: Administrator,
	): Promise<OrderConfirmation>;
}
