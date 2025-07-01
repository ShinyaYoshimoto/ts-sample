import { GetOrderQuery } from './getOrderQuery';
import { Order } from '../../domain/model/order';

export interface GetOrderUseCase {
  getOrder(query: GetOrderQuery): Promise<Order | null>;
}
