import { PayUseCase } from '../../port/in/payUseCase';
import { PayCommand } from '../../port/in/payCommand';
import { Payment } from '../model/payment';
import { PayOrderPort } from '../../port/out/payOrderPort';

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
