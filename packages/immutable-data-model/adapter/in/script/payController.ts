import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { Order } from '../../../application/domain/model/order';
import { GetOrderService } from '../../../application/domain/service/getOrderService';
import { PayService } from '../../../application/domain/service/payService';
import { GetOrderQuery } from '../../../application/port/in/getOrderQuery';
import type { GetOrderUseCase } from '../../../application/port/in/getOrderUseCase';
import { PayCommand } from '../../../application/port/in/payCommand';
import type { PayUseCase } from '../../../application/port/in/payUseCase';
import { PrismaClient } from '../../../generated/prisma';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
import { PaymentPersistenceAdapter } from '../../out/persistence/paymentPersistenceAdapter';

class PayController {
	constructor(
		private readonly payUseCase: PayUseCase,
		private readonly getOrderUseCase: GetOrderUseCase,
	) {}

	public handle = async (request: Request) => {
		try {
			console.log('PayController: start');

			const orderQuery = new GetOrderQuery(request.orderId);
			const order = await this.getOrderUseCase.getOrder(orderQuery);

			if (!order || !(order instanceof Order)) {
				throw new Error('Order not found');
			}

			const command = new PayCommand(order);
			await this.payUseCase.pay(command);

			console.log('PayController: end');
		} catch (error) {
			console.error('PayController: failed', error);
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

	const paymentPersistenceAdapter = new PaymentPersistenceAdapter(prisma);
	const payService = new PayService(paymentPersistenceAdapter);

	// Request
	const request: Request = {
		orderId: Number.parseInt(list[0]),
	};
	new PayController(payService, getOrderService).handle(request);
});
