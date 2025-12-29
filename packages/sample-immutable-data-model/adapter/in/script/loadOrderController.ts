import { GetOrderUseCase } from '../../../application/port/in/getOrderUseCase';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { PrismaClient } from '../../../generated/prisma';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
import { GetOrderService } from '../../../application/domain/service/getOrderService';
import { GetOrderQuery } from '../../../application/port/in/getOrderQuery';
import { Order } from '../../../application/domain/model/order';
import { CanceledOrder } from '../../../application/domain/model/canceledOrder';
class LoadOrderController {
  constructor(private readonly getOrderUseCase: GetOrderUseCase) {}

  public handle = async (request: Request): Promise<Response> => {
    try {
      console.log('LoadOrderController: start');

      const orderQuery = new GetOrderQuery(request.orderId);
      const order = await this.getOrderUseCase.getOrder(orderQuery);

      if (
        !order ||
        !(order instanceof Order || order instanceof CanceledOrder)
      ) {
        throw new Error('Order not found');
      }

      console.log('LoadOrderController: end');

      // FIXME: こういう書き方になるくらいなら、CanceledOrderモデルはOrderを継承した方がいい？
      return order instanceof CanceledOrder
        ? {
            orderId: order.order.id,
            memberId: order.order.member.id,
            orderedAt: order.order.orderedAt,
            confirmedAt: order.order.confirmedAt,
            paymentScheduleAt: order.order.paymentScheduleAt,
            paidAt: order.order.paidAt,
            invoiceIssuedAt: order.order.invoiceIssuedAt,
            canceledAt: order.canceledAt,
          }
        : {
            orderId: order.id,
            memberId: order.member.id,
            orderedAt: order.orderedAt,
            confirmedAt: order.confirmedAt,
            paymentScheduleAt: order.paymentScheduleAt,
            paidAt: order.paidAt,
            invoiceIssuedAt: order.invoiceIssuedAt,
          };
    } catch (error) {
      console.error('LoadOrderController: failed', error);
      throw error;
    }
  };
}

type Request = {
  orderId: number;
};

type Response = {
  orderId: number;
  memberId: number;
  orderedAt: Date;
  confirmedAt?: Date;
  paymentScheduleAt?: Date;
  paidAt?: Date;
  invoiceIssuedAt?: Date;
  canceledAt?: Date;
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
  const order = new LoadOrderController(getOrderService).handle(request);
  console.log(order);
});
