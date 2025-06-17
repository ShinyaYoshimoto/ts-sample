import { SendMoneyCommand } from '../../port/in/sendMoneyCommand';
import { SendMoneyUseCase } from '../../port/in/sendMoneyUseCase';
import { LoadAccountPort } from '../../port/out/loadAccountPort';
import { UpdateAccountStatePort } from '../../port/out/updateAccountStatePort';

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
