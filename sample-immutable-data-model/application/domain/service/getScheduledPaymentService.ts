import { GetScheduledPaymentUseCase } from '../../port/in/getScheduledPaymentUseCase';
import { GetScheduledPaymentQuery } from '../../port/in/getScheduledPaymentQuery';
import { ScheduledPayment } from '../model/scheduledPayment';
import { LoadScheduledPaymentPort } from '../../port/out/loadScheduledPaymentPort';

export class GetScheduledPaymentService implements GetScheduledPaymentUseCase {
  constructor(private readonly loadScheduledPaymentPort: LoadScheduledPaymentPort) {}

  async getScheduledPayment(query: GetScheduledPaymentQuery): Promise<ScheduledPayment | null> {
    const scheduledPayment = await this.loadScheduledPaymentPort.loadScheduledPayment(query.scheduledPaymentId);
    if (!scheduledPayment) {
      return null;
    }
    return new ScheduledPayment(
      scheduledPayment.id,
      scheduledPayment.orderId,
      scheduledPayment.scheduledPaymentDate,
      scheduledPayment.scheduledPaymentRegisteredAt,
    );
  }
}
