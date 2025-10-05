import { z } from 'zod';

export const addressFormSchema = z.object({
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000'),
  street: z
    .string()
    .min(1, 'Rua é obrigatória')
    .min(2, 'Rua deve ter pelo menos 2 caracteres'),
  number: z
    .string()
    .min(1, 'Número é obrigatório'),
  complement: z
    .string()
    .optional(),
  neighborhood: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  city: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z
    .string()
    .min(1, 'Estado é obrigatório')
    .length(2, 'Estado deve ter 2 caracteres'),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  isDefault: z
    .boolean()
    .default(false),
});

export type AddressFormData = z.infer<typeof addressFormSchema>; 