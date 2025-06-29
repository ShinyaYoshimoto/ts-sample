export class Order {
  constructor(
    readonly orderId: number,
    readonly memberId: number,
    readonly orderedAt: Date,
  ) {
    if (!orderId) {
      throw new Error('orderId is required');
    }

    if (!memberId) {
      throw new Error('memberId is required');
    }
  }
}