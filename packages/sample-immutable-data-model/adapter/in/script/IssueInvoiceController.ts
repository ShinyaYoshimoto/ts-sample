import { IssueInvoiceUseCase } from '../../../application/port/in/issueInvoiceUseCase';
import { GetOrderUseCase } from '../../../application/port/in/getOrderUseCase';
import { GetOrderQuery } from '../../../application/port/in/getOrderQuery';
import { IssueInvoiceCommand } from '../../../application/port/in/issueInvoiceCommand';
import { PrismaClient } from '../../../generated/prisma';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
import { GetOrderService } from '../../../application/domain/service/getOrderService';
import { InvoiceIssuancePersistenceAdapter } from '../../out/persistence/invoiceIssuancePersistenceAdapter';
import { IssueInvoiceService } from '../../../application/domain/service/issueInvoiceService';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { Order } from '../../../application/domain/model/order';

class IssueInvoiceController {
  constructor(
    private readonly issueInvoiceUseCase: IssueInvoiceUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  public handle = async (request: Request) => {
    try {
      console.log('IssueInvoiceController: start');

      const orderQuery = new GetOrderQuery(request.orderId);
      const order = await this.getOrderUseCase.getOrder(orderQuery);

      if (!order || !(order instanceof Order)) {
        throw new Error('Order not found');
      }

      const command = new IssueInvoiceCommand(order);
      await this.issueInvoiceUseCase.issueInvoice(command);

      console.log('IssueInvoiceController: end');
    } catch (error) {
      console.error('IssueInvoiceController: failed', error);
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

  const invoiceIssuancePersistenceAdapter =
    new InvoiceIssuancePersistenceAdapter(prisma);
  const issueInvoiceService = new IssueInvoiceService(
    invoiceIssuancePersistenceAdapter,
  );

  // Request
  const request: Request = {
    orderId: parseInt(list[0]),
  };
  new IssueInvoiceController(issueInvoiceService, getOrderService).handle(
    request,
  );
});
