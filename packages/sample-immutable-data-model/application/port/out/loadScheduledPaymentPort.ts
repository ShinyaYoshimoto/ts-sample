import type { Order } from '../../domain/model/order';
import type { ScheduledPayment } from '../../domain/model/scheduledPayment';

export interface LoadScheduledPaymentPort {
	loadScheduledPayment(order: Order): Promise<ScheduledPayment | null>;
}
