import { Order } from '../../domain/model/order';
import { CanceledOrder } from '../../domain/model/canceledOrder';
export interface LoadOrderPort {
  loadOrder(orderId: number): Promise<Order | CanceledOrder>;
}
