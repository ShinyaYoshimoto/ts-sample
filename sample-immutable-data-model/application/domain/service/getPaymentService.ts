import { GetPaymentUseCase } from '../../port/in/getPaymentUseCase';
import { GetPaymentQuery } from '../../port/in/getPaymentQuery';
import { Payment } from '../model/payment';
import { LoadPaidOrderPort } from '../../port/out/loadPaidOrderPort';

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
