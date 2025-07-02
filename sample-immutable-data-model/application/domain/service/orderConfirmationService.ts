import { OrderConfirmationUseCase } from '../../port/in/orderConfirmationUseCase';
import { OrderConfirmationCommand } from '../../port/in/orderConfirmationCommand';
import { OrderConfirmation } from '../model/orderConfirmation';
import { ConfirmOrderPort } from '../../port/out/confirmOrderPort';

export class OrderConfirmationService implements OrderConfirmationUseCase {
  constructor(private readonly confirmOrderPort: ConfirmOrderPort) {}

  async confirmOrder(command: OrderConfirmationCommand): Promise<void> {
    // ここに注文確認のビジネスロジックを実装します。
    // 例: データベースに注文確認情報を保存する
    await this.confirmOrderPort.confirmOrder(
      command.order,
      command.administrator,
    );
  }
}
