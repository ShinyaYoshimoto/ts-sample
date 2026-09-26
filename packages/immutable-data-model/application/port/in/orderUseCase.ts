import { Order } from '../../domain/model/order';
import type { OrderCommand } from './orderCommand';

export interface OrderUseCase {
	order(command: OrderCommand): Promise<void>;
}
