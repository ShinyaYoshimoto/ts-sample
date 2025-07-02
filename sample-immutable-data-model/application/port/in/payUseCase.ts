import { PayCommand } from './payCommand';
import { Payment } from '../../domain/model/payment';

export interface PayUseCase {
  pay(command: PayCommand): Promise<Payment | null>;
}
