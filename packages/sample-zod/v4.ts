import * as z from 'zod/v4';

export const sample = () => {
  const registry = z.registry<{
    name: string;
    age: number;
  }>();
};
