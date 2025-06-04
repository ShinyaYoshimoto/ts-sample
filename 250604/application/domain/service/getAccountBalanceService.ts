import { GetAccountBalanceQuery } from "../../port/in/getAccountBalanceQuery";
import { GetAccountBalanceUseCase } from "../../port/in/getAccountBalanceUseCase";
import { LoadAccountPort } from "../../port/out/loadAccountPort";
import { Money } from "../model/money";

export class GetAccountBalanceService implements GetAccountBalanceUseCase {
  constructor(
    private readonly loadAccountPort: LoadAccountPort
  ) {}

  getAccountBalance(query: GetAccountBalanceQuery): Money {
    const account = this.loadAccountPort.loadAccount(query.accountId, new Date());
    return account.calculateBalance();
  }
}
