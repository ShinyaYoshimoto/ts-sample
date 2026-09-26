import type { Payment } from '../../domain/model/payment';
import type { PayCommand } from './payCommand';

export interface PayUseCase {
	pay(command: PayCommand): Promise<Payment | null>;
}
