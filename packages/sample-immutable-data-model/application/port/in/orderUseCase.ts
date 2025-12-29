import { Order } from '../../domain/model/order';
import { OrderCommand } from './orderCommand';

export interface OrderUseCase {
  order(command: OrderCommand): Promise<void>;
}
