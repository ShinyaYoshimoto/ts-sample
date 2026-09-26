import type { OrderCancellation } from '../../domain/model/orderCancellation';
import type { CancelOrderCommand } from './cancelOrderCommand';

export interface CancelOrderUseCase {
	cancelOrder(command: CancelOrderCommand): Promise<OrderCancellation | null>;
}
