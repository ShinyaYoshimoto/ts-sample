import { Order } from '../../domain/model/order';
import { CanceledOrder } from '../../domain/model/canceledOrder';

export interface SearchOrderUseCase {
  searchOrders(): Promise<(Order | CanceledOrder)[]>;
}
