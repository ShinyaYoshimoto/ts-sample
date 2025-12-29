import { Order } from '../../domain/model/order';
import { Administrator } from '../../domain/model/administrator';
import { OrderConfirmation } from '../../domain/model/orderConfirmation';

export interface ConfirmOrderPort {
  confirmOrder(order: Order, administrator: Administrator): Promise<OrderConfirmation>;
}
