import { Order } from '../../domain/model/order';
import { ScheduledPayment } from '../../domain/model/scheduledPayment';

export interface RegisterScheduledPaymentPort {
  registerScheduledPayment(
    order: Order,
    scheduledPaymentDate: Date,
  ): Promise<ScheduledPayment>;
}
