import type { GetPaymentQuery } from '../../port/in/getPaymentQuery';
import type { GetPaymentUseCase } from '../../port/in/getPaymentUseCase';
import type { LoadPaidOrderPort } from '../../port/out/loadPaidOrderPort';
import type { Payment } from '../model/payment';

export class GetPaymentService implements GetPaymentUseCase {
	constructor(private readonly loadPaidOrderPort: LoadPaidOrderPort) {}

	async getPayment(query: GetPaymentQuery): Promise<Payment | null> {
		const payment = await this.loadPaidOrderPort.getPayment(query.order);
		if (!payment) {
			return null;
		}
		return payment;
	}
}
