import { Order } from '../../domain/model/order';
import { CanceledOrder } from '../../domain/model/canceledOrder';
export interface LoadOrderPort {
  loadOrder(orderId: number): Promise<Order | CanceledOrder>;
  // FIXME: これはInterface分けた方がいい？
  searchOrders(): Promise<(Order | CanceledOrder)[]>;
}
