export class ScheduledPayment {
  constructor(
    public readonly id: number,
    public readonly orderId: number,
    public readonly scheduledPaymentDate: Date,
    public readonly scheduledPaymentRegisteredAt: Date,
  ) {}
}
