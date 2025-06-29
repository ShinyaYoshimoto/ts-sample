export class Member {
  constructor(
    readonly memberId: number,
    readonly name: string,
  ) {
    if (!memberId) {
      throw new Error('memberId is required');
    }

    if (name.length === 0) {
      throw new Error('name is required');
    }
  }
}
