import type { CanceledOrder } from '../../domain/model/canceledOrder';
import type { Order } from '../../domain/model/order';
export interface LoadOrderPort {
	loadOrder(orderId: number): Promise<Order | CanceledOrder>;
	// FIXME: これはInterface分けた方がいい？
	searchOrders(): Promise<(Order | CanceledOrder)[]>;
}
