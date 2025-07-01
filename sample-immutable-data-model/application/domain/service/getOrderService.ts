import { GetOrderUseCase } from '../../port/in/getOrderUseCase';
import { GetOrderQuery } from '../../port/in/getOrderQuery';
import { Order } from '../model/order';
import { LoadOrderPort } from '../../port/out/loadOrderPort';

export class GetOrderService implements GetOrderUseCase {
  constructor(private readonly loadOrderPort: LoadOrderPort) {}

  async getOrder(query: GetOrderQuery): Promise<Order | null> {
    const order = await this.loadOrderPort.loadOrder(query.orderId);
    if (!order) {
      return null;
    }
    return new Order(order.id, order.member, order.orderedAt);
  }
}
