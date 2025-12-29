import * as z from 'zod';

export const sample = (): z.infer<typeof schema> => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  const data = { name: 'John', age: 30 };

  const result = schema.parse(data);
  return result;
};
