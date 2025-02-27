import { z } from 'zod';

export const validateInput = <T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> => {
  return schema.parse(data);
};
