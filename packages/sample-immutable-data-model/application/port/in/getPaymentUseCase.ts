import { GetPaymentQuery } from './getPaymentQuery';
import { Payment } from '../../domain/model/payment';

export interface GetPaymentUseCase {
  getPayment(query: GetPaymentQuery): Promise<Payment | null>;
}
