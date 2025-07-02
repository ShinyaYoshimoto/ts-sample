import { PrismaClient } from '../../../generated/prisma';
import { ScheduledPayment } from '../../../application/domain/model/scheduledPayment';
import { RegisterScheduledPaymentPort } from '../../../application/port/out/registerScheduledPaymentPort';
import { LoadScheduledPaymentPort } from '../../../application/port/out/loadScheduledPaymentPort';
import { Order } from '../../../application/domain/model/order';

export class ScheduledPaymentPersistenceAdapter
  implements RegisterScheduledPaymentPort, LoadScheduledPaymentPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async registerScheduledPayment(
    order: Order,
    scheduledPaymentDate: Date,
  ): Promise<ScheduledPayment> {
    const scheduledPayment = await this.prisma.scheduledPayment.create({
      data: {
        orderId: order.id,
        scheduledPaymentDate: scheduledPaymentDate,
        scheduledPaymentRegisteredAt: new Date(),
      },
    });
    return new ScheduledPayment(
      scheduledPayment.id,
      order,
      scheduledPayment.scheduledPaymentDate,
      scheduledPayment.scheduledPaymentRegisteredAt,
    );
  }

  async loadScheduledPayment(order: Order): Promise<ScheduledPayment | null> {
    const scheduledPayment = await this.prisma.scheduledPayment.findUnique({
      where: { orderId: order.id },
    });
    if (!scheduledPayment) {
      return null;
    }
    return new ScheduledPayment(
      scheduledPayment.id,
      order,
      scheduledPayment.scheduledPaymentDate,
      scheduledPayment.scheduledPaymentRegisteredAt,
    );
  }
}
