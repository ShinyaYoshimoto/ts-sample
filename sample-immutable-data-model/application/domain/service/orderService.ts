import { OrderCommand } from '../../port/in/orderCommand';
import { OrderUseCase } from '../../port/in/orderUseCase';
import { RegisterOrderPort } from '../../port/out/registerOrderPort';
import { Order } from '../model/order';

export class OrderService implements OrderUseCase {
  constructor(private readonly registerOrderPort: RegisterOrderPort) {}

  order = async (command: OrderCommand): Promise<Order> => {
    const order = await this.registerOrderPort.registerOrder(command.member);

    if (!order) {
      throw new Error('Order failed');
    }

    return order;
  };
}
