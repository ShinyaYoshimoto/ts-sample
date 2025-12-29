import { Member } from './member';

describe('Member', () => {
	it('should be created', () => {
    const member = new Member(1, 'John Doe');
    expect(member).toBeDefined();
  });

  describe('should not be created', () => {
    it('when id is negative', () => {
      expect(() => new Member(-1, 'John Doe')).toThrow();
    });

    it('when name is empty', () => {
      expect(() => new Member(1, '')).toThrow();
    });
  });
});