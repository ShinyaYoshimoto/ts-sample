import { ScheduledPayment } from "../../domain/model/scheduledPayment";

export interface RegisterScheduledPaymentPort {
  registerScheduledPayment(orderId: number, scheduledPaymentDate: Date): Promise<ScheduledPayment>;
}
