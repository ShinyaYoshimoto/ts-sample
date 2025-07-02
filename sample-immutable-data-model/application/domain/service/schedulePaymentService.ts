import { SchedulePaymentUseCase } from '../../port/in/schedulePaymentUseCase';
import { SchedulePaymentCommand } from '../../port/in/schedulePaymentCommand';
import { RegisterScheduledPaymentPort } from '../../port/out/registerScheduledPaymentPort';

export class SchedulePaymentService implements SchedulePaymentUseCase {
  constructor(
    private readonly registerScheduledPaymentPort: RegisterScheduledPaymentPort,
  ) {}

  async schedulePayment(command: SchedulePaymentCommand): Promise<void> {
    const { order, scheduledPaymentDate } = command;

    if (!order.confirmedAt) {
      throw new Error('Order is not confirmed');
    }

    await this.registerScheduledPaymentPort.registerScheduledPayment(
      order,
      scheduledPaymentDate,
    );
  }
}
