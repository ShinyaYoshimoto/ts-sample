import type { CanceledOrder } from '../../domain/model/canceledOrder';
import type { Order } from '../../domain/model/order';
import type { GetOrderQuery } from './getOrderQuery';
export interface GetOrderUseCase {
	getOrder(query: GetOrderQuery): Promise<Order | CanceledOrder | null>;
}
