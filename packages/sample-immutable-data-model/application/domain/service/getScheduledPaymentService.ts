import { GetScheduledPaymentUseCase } from '../../port/in/getScheduledPaymentUseCase';
import { GetScheduledPaymentQuery } from '../../port/in/getScheduledPaymentQuery';
import { ScheduledPayment } from '../model/scheduledPayment';
import { LoadScheduledPaymentPort } from '../../port/out/loadScheduledPaymentPort';

export class GetScheduledPaymentService implements GetScheduledPaymentUseCase {
  constructor(private readonly loadScheduledPaymentPort: LoadScheduledPaymentPort) {}

  async getScheduledPayment(
    query: GetScheduledPaymentQuery,
  ): Promise<ScheduledPayment | null> {
    const scheduledPayment = await this.loadScheduledPaymentPort.loadScheduledPayment(
      query.order,
    );
    if (!scheduledPayment) {
      return null;
    }
    return scheduledPayment;
  }
}
