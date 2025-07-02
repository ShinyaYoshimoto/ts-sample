import { PrismaClient } from '../../../generated/prisma';
import { ScheduledPayment } from '../../../application/domain/model/scheduledPayment';
import { RegisterScheduledPaymentPort } from '../../../application/port/out/registerScheduledPaymentPort';
import { LoadScheduledPaymentPort } from '../../../application/port/out/loadScheduledPaymentPort';

export class ScheduledPaymentPersistenceAdapter
  implements RegisterScheduledPaymentPort, LoadScheduledPaymentPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async registerScheduledPayment(
    orderId: number,
    scheduledPaymentDate: Date,
  ): Promise<ScheduledPayment> {
    const scheduledPayment = await this.prisma.scheduledPayment.create({
      data: {
        orderId: orderId,
        scheduledPaymentDate: scheduledPaymentDate,
        scheduledPaymentRegisteredAt: new Date(),
      },
    });
    return new ScheduledPayment(
      scheduledPayment.id,
      scheduledPayment.orderId,
      scheduledPayment.scheduledPaymentDate,
      scheduledPayment.scheduledPaymentRegisteredAt,
    );
  }

  async loadScheduledPayment(orderId: number): Promise<ScheduledPayment | null> {
    const scheduledPayment = await this.prisma.scheduledPayment.findUnique({
      where: { orderId: orderId },
    });
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
