import { Order } from '../../domain/model/order';

export class SchedulePaymentCommand {
  constructor(
    public readonly order: Order,
    public readonly scheduledPaymentDate: Date,
  ) {}
}
