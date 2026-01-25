import type { GetScheduledPaymentQuery } from '../../port/in/getScheduledPaymentQuery';
import type { GetScheduledPaymentUseCase } from '../../port/in/getScheduledPaymentUseCase';
import type { LoadScheduledPaymentPort } from '../../port/out/loadScheduledPaymentPort';
import type { ScheduledPayment } from '../model/scheduledPayment';

export class GetScheduledPaymentService implements GetScheduledPaymentUseCase {
	constructor(
		private readonly loadScheduledPaymentPort: LoadScheduledPaymentPort,
	) {}

	async getScheduledPayment(
		query: GetScheduledPaymentQuery,
	): Promise<ScheduledPayment | null> {
		const scheduledPayment =
			await this.loadScheduledPaymentPort.loadScheduledPayment(query.order);
		if (!scheduledPayment) {
			return null;
		}
		return scheduledPayment;
	}
}
