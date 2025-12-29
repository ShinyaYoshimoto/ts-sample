export class Member {
  constructor(
    readonly id: number,
    readonly name: string,
  ) {
    if (!id || id < 0) {
      throw new Error('memberId is required');
    }

    if (name.length === 0) {
      throw new Error('name is required');
    }
  }
}
