import { OrderConfirmationCommand } from './orderConfirmationCommand';
import { OrderConfirmation } from '../../domain/model/orderConfirmation';

export interface OrderConfirmationUseCase {
  confirmOrder(command: OrderConfirmationCommand): Promise<void>;
}