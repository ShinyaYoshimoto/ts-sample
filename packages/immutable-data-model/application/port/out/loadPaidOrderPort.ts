import type { Order } from '../../domain/model/order';
import type { Payment } from '../../domain/model/payment';

export interface LoadPaidOrderPort {
	getPayment(order: Order): Promise<Payment | null>;
}
