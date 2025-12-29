import { GetOrderUseCase } from '../../port/in/getOrderUseCase';
import { GetOrderQuery } from '../../port/in/getOrderQuery';
import { Order } from '../model/order';
import { LoadOrderPort } from '../../port/out/loadOrderPort';
import { CanceledOrder } from '../model/canceledOrder';
export class GetOrderService implements GetOrderUseCase {
  constructor(private readonly loadOrderPort: LoadOrderPort) {}

  async getOrder(query: GetOrderQuery): Promise<Order | CanceledOrder | null> {
    const order = await this.loadOrderPort.loadOrder(query.orderId);
    if (!order) {
      return null;
    }

    return order;
  }
}
