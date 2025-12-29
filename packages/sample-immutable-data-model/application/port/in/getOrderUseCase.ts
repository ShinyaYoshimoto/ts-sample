import { GetOrderQuery } from './getOrderQuery';
import { Order } from '../../domain/model/order';
import { CanceledOrder } from '../../domain/model/canceledOrder';
export interface GetOrderUseCase {
  getOrder(query: GetOrderQuery): Promise<Order | CanceledOrder | null>;
}
