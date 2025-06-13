import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
}).passthrough(); // permite campos adicionales

export type RegisterInput = z.infer<typeof RegisterSchema>;
