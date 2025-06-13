import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' })
}).passthrough();

export type LoginInput = z.infer<typeof LoginSchema>;
