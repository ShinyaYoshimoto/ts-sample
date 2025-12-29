import { CancelOrderUseCase } from '../../port/in/cancelOrderUseCase';
import { CancelOrderCommand } from '../../port/in/cancelOrderCommand';
import { OrderCancellation } from '../model/orderCancellation';
import { CancelOrderPort } from '../../port/out/cancelOrderPort';

export class CancelOrderService implements CancelOrderUseCase {
  constructor(private readonly cancelOrderPort: CancelOrderPort) {}

  async cancelOrder(
    command: CancelOrderCommand,
  ): Promise<OrderCancellation | null> {
    if (
      command.order.paymentScheduleAt &&
      command.order.paymentScheduleAt < new Date()
    ) {
      throw new Error('Payment schedule is in the past');
    }

    if (command.order.paidAt) {
      throw new Error('Order is paid');
    }

    if (command.order.invoiceIssuedAt) {
      throw new Error('Order is invoiced');
    }

    const orderCancellation =
      await this.cancelOrderPort.createOrderCancellation(command.order);
    return new OrderCancellation(
      orderCancellation.id,
      orderCancellation.order,
      orderCancellation.cancelledAt,
    );
  }
}
