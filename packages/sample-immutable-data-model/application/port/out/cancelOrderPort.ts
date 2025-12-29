import { OrderCancellation } from '../../domain/model/orderCancellation';
import { Order } from '../../domain/model/order';

export interface CancelOrderPort {
  createOrderCancellation(order: Order): Promise<OrderCancellation>;
}
