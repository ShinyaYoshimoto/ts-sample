import type { Order } from '../../domain/model/order';
import type { OrderCancellation } from '../../domain/model/orderCancellation';

export interface CancelOrderPort {
	createOrderCancellation(order: Order): Promise<OrderCancellation>;
}
