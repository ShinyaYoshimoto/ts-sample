import { OrderConfirmation } from '../../domain/model/orderConfirmation';
import type { OrderConfirmationCommand } from './orderConfirmationCommand';

export interface OrderConfirmationUseCase {
	confirmOrder(command: OrderConfirmationCommand): Promise<void>;
}
