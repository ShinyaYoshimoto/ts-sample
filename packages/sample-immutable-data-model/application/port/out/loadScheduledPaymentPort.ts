import { Order } from '../../domain/model/order';
import { ScheduledPayment } from '../../domain/model/scheduledPayment';

export interface LoadScheduledPaymentPort {
  loadScheduledPayment(order: Order): Promise<ScheduledPayment | null>;
}
