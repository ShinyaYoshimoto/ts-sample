import { Payment } from '../../domain/model/payment';
import { Order } from '../../domain/model/order';

export interface PayOrderPort {
  createPayment(order: Order): Promise<Payment>;
}