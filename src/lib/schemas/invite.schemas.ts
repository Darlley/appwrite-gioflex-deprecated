import { z } from 'zod';
import { USER_LABELS } from '../constants';

export const inviteFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  role: z
    .enum([
      USER_LABELS.COMPANY_CLIENT,
      USER_LABELS.COMPANY_EMPLOYEE,
      USER_LABELS.COMPANY_OWNER
    ], {
      required_error: 'Tipo de usuário é obrigatório',
    }),
  message: z
    .string()
    .optional(),
});

export type InviteFormData = z.infer<typeof inviteFormSchema>; 