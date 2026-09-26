import type { SendMoneyCommand } from './sendMoneyCommand';

export interface SendMoneyUseCase {
	sendMoney(command: SendMoneyCommand): boolean;
}
