import type { OrderConfirmationCommand } from '../../port/in/orderConfirmationCommand';
import type { OrderConfirmationUseCase } from '../../port/in/orderConfirmationUseCase';
import type { ConfirmOrderPort } from '../../port/out/confirmOrderPort';

export class OrderConfirmationService implements OrderConfirmationUseCase {
	constructor(private readonly confirmOrderPort: ConfirmOrderPort) {}

	async confirmOrder(command: OrderConfirmationCommand): Promise<void> {
		await this.confirmOrderPort.confirmOrder(
			command.order,
			command.administrator,
		);
	}
}
