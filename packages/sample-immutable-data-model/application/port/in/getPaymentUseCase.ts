import type { Payment } from '../../domain/model/payment';
import type { GetPaymentQuery } from './getPaymentQuery';

export interface GetPaymentUseCase {
	getPayment(query: GetPaymentQuery): Promise<Payment | null>;
}
