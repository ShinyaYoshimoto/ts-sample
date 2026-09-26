import type { CanceledOrder } from '../../domain/model/canceledOrder';
import type { Order } from '../../domain/model/order';

export interface SearchOrderUseCase {
	searchOrders(): Promise<(Order | CanceledOrder)[]>;
}
