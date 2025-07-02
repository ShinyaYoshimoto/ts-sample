import { GetScheduledPaymentQuery } from './getScheduledPaymentQuery';
import { ScheduledPayment } from '../../domain/model/scheduledPayment';

export interface GetScheduledPaymentUseCase {
  getScheduledPayment(query: GetScheduledPaymentQuery): Promise<ScheduledPayment | null>;
}
