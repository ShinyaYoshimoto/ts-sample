import { Payment } from '../../domain/model/payment';
import { Order } from '../../domain/model/order';

export interface LoadPaidOrderPort {
  getPayment(order: Order): Promise<Payment | null>;
}
