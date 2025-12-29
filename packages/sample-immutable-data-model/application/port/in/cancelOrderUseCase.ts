import { CancelOrderCommand } from './cancelOrderCommand';
import { OrderCancellation } from '../../domain/model/orderCancellation';

export interface CancelOrderUseCase {
  cancelOrder(command: CancelOrderCommand): Promise<OrderCancellation | null>;
}
