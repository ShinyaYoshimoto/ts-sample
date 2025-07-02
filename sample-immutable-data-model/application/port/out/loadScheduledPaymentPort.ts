import { ScheduledPayment } from "../../domain/model/scheduledPayment";

export interface LoadScheduledPaymentPort {
  loadScheduledPayment(orderId: number): Promise<ScheduledPayment | null>;
}
