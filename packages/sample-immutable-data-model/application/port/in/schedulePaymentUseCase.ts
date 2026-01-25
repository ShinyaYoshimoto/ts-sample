import type { SchedulePaymentCommand } from './schedulePaymentCommand';

export interface SchedulePaymentUseCase {
	schedulePayment(command: SchedulePaymentCommand): Promise<void>;
}
