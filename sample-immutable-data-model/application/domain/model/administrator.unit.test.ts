import { Administrator } from './administrator';

describe('Administrator', () => {
  it('should be created', () => {
    const administrator = new Administrator(1, 'John Doe');
    expect(administrator).toBeDefined();
  });

  describe('should not be created', () => {
    it('when id is negative', () => {
      expect(() => new Administrator(-1, 'John Doe')).toThrow();
    });

    it('when name is empty', () => {
      expect(() => new Administrator(1, '')).toThrow();
    });
  });
});
