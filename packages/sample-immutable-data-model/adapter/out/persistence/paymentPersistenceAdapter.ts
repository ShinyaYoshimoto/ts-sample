import { PrismaClient } from '../../../generated/prisma';
import { Payment } from '../../../application/domain/model/payment';
import { PayOrderPort } from '../../../application/port/out/payOrderPort';
import { LoadPaidOrderPort } from '../../../application/port/out/loadPaidOrderPort';
import { Order } from '../../../application/domain/model/order';

export class PaymentPersistenceAdapter implements PayOrderPort, LoadPaidOrderPort {
  constructor(private readonly prisma: PrismaClient) {}

  async createPayment(order: Order): Promise<Payment> {
    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        paidAt: new Date(),
      },
    });
    return new Payment(payment.id, order, payment.paidAt);
  }

  async getPayment(order: Order): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });
    if (!payment) {
      return null;
    }
    // ここでPrismaのPaymentモデルからドメインのPaymentモデルに変換
    return new Payment(payment.id, order, payment.paidAt);
  }
}
