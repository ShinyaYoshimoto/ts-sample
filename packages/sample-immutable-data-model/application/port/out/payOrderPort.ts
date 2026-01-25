import type { Order } from '../../domain/model/order';
import type { Payment } from '../../domain/model/payment';

export interface PayOrderPort {
	createPayment(order: Order): Promise<Payment>;
}
