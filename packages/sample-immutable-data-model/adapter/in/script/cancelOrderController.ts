import { CancelOrderUseCase } from '../../../application/port/in/cancelOrderUseCase';
import { GetOrderUseCase } from '../../../application/port/in/getOrderUseCase';
import { GetOrderQuery } from '../../../application/port/in/getOrderQuery';
import { CancelOrderCommand } from '../../../application/port/in/cancelOrderCommand';
import { PrismaClient } from '../../../generated/prisma';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
import { GetOrderService } from '../../../application/domain/service/getOrderService';
import { OrderCancellationPersistenceAdapter } from '../../out/persistence/orderCancellationPersistenceAdapter';
import { CancelOrderService } from '../../../application/domain/service/cancelOrderService';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { Order } from '../../../application/domain/model/order';

class CancelOrderController {
  constructor(
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  public handle = async (request: Request) => {
    try {
      console.log('CancelOrderController: start');

      const orderQuery = new GetOrderQuery(request.orderId);
      const order = await this.getOrderUseCase.getOrder(orderQuery);

      if (!order || !(order instanceof Order)) {
        throw new Error('Order not found');
      }

      const command = new CancelOrderCommand(order);
      await this.cancelOrderUseCase.cancelOrder(command);

      console.log('CancelOrderController: end');
    } catch (error) {
      console.error('CancelOrderController: failed', error);
    }
  };
}

type Request = {
  orderId: number;
};

const rl = readline.createInterface({ input, output });
const list: string[] = [];

// initial prompt
rl.setPrompt('orderId: ');
rl.prompt();

rl.on('line', (line) => {
  list.push(line);

  if (list.length >= 1) {
    rl.close();
  }
});

rl.on('close', () => {
  const prisma = new PrismaClient();
  const orderPersistenceAdapter = new OrderPersistenceAdapter(prisma);
  const getOrderService = new GetOrderService(orderPersistenceAdapter);

  const orderCancellationPersistenceAdapter = new OrderCancellationPersistenceAdapter(prisma);
  const cancelOrderService = new CancelOrderService(orderCancellationPersistenceAdapter);

  // Request
  const request: Request = {
    orderId: parseInt(list[0]),
  };
  new CancelOrderController(cancelOrderService, getOrderService).handle(request);
});