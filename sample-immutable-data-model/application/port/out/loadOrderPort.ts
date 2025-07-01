import { Order } from '../../domain/model/order';

export interface LoadOrderPort {
  loadOrder(orderId: number): Promise<Order>;
}
