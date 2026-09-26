import type { ScheduledPayment } from '../../domain/model/scheduledPayment';
import type { GetScheduledPaymentQuery } from './getScheduledPaymentQuery';

export interface GetScheduledPaymentUseCase {
	getScheduledPayment(
		query: GetScheduledPaymentQuery,
	): Promise<ScheduledPayment | null>;
}
