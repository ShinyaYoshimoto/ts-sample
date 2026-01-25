import type { PayCommand } from '../../port/in/payCommand';
import type { PayUseCase } from '../../port/in/payUseCase';
import type { PayOrderPort } from '../../port/out/payOrderPort';
import type { Payment } from '../model/payment';

export class PayService implements PayUseCase {
	constructor(private readonly payOrderPort: PayOrderPort) {}

	async pay(command: PayCommand): Promise<Payment | null> {
		if (!command.order.confirmedAt) {
			throw new Error('Order is not confirmed');
		}

		if (!command.order.paymentScheduleAt) {
			throw new Error('Payment schedule is not set');
		}

		const paidOrder = await this.payOrderPort.createPayment(command.order);
		return paidOrder;
	}
}
