import type { SendMoneyCommand } from '../../port/in/sendMoneyCommand';
import type { SendMoneyUseCase } from '../../port/in/sendMoneyUseCase';
import type { LoadAccountPort } from '../../port/out/loadAccountPort';
import type { UpdateAccountStatePort } from '../../port/out/updateAccountStatePort';

export class SendMoneyService implements SendMoneyUseCase {
	constructor(
		private readonly loadAccountPort: LoadAccountPort,
		private readonly updateAccountStatePort: UpdateAccountStatePort,
	) {}

	sendMoney(command: SendMoneyCommand): boolean {
		// TODO
		return true;
	}
}
