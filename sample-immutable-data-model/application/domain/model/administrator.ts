export class Administrator {
  constructor(
    public readonly id: number,
    public readonly name: string, // 仮でnameプロパティを追加
  ) {
    if (!id || id < 0) {
      throw new Error('id is required');
    }

    if (name.length === 0) {
      throw new Error('name is required');
    }
  }
}
