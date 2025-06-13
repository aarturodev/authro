import { z, ZodSchema } from 'zod';

export const validate = <T>(schema: ZodSchema<T>, data: unknown): {
  success: true;
  status: number;
  data: T;
} | {
  success: false;
  status: number;
  message: string;
  errors: Record<string, any>;
} => {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      status: 400,
      message: 'Validation error',
      errors: result.error.format()
    };
  } if (result.data === undefined) {
    return {
      success: false,
      status: 400,
      message: 'Data is undefined',
      errors: { data: 'Data cannot be undefined' }
    };
  }
  return {
    success: true,
    status: 200,
    data: result.data
  };
 
};
