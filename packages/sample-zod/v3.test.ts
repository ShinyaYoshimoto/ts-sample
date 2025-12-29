import { sample } from './v3';

describe('Zod v3', () => {
  it('should be able to validate data', () => {
    const result = sample();
    expect(result).toEqual({ name: 'John', age: 30 });
  });
});
