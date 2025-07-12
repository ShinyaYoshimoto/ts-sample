import { GetOrderUseCase } from "../../../application/port/in/getOrderUseCase";
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { PrismaClient } from "../../../generated/prisma";
import { OrderPersistenceAdapter } from "../../out/persistence/orderPersistenceAdapter";
import { GetOrderService } from "../../../application/domain/service/getOrderService";
import { GetOrderQuery } from "../../../application/port/in/getOrderQuery";
import { Order } from "../../../application/domain/model/order";
class LoadOrderController {
  constructor(
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  public handle = async (request: Request) => {
    try {
      console.log('LoadOrderController: start');

      const orderQuery = new GetOrderQuery(request.orderId);
      const order = await this.getOrderUseCase.getOrder(orderQuery);

      if (!order || !(order instanceof Order)) {
        throw new Error('Order not found');
      }

      console.log('LoadOrderController: end', order);

    } catch (error) {
      console.error('LoadOrderController: failed', error);
    }
  };
}

type Request = {
  orderId: number;
};

const rl = readline.createInterface({
  input,
  output,
});
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

  // Request
  const request: Request = {
    orderId: parseInt(list[0]),
  };
  new LoadOrderController(getOrderService).handle(request);
});

