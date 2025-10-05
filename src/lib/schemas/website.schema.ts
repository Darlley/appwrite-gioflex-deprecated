import { z } from 'zod';

export const websiteSchema = z.object({
  active_website: z.boolean().default(false).optional(),

  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(250, 'Máximo de 250 caracteres'),

  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(250, 'Máximo de 250 caracteres')
    .optional(),

  buttonText: z
    .string()
    .min(1, 'Texto do botão é obrigatório')
    .max(100)
    .optional(),

  buttonLink: z
    .string()
    .url('Link do botão inválido')
    .optional(),

  //primaryColor: z
  //  .string()
 //   .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor primária inválida (#HEX)').optional(),

  //secondaryColor: z
  //  .string()
   // .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor secundária inválida (#HEX)').optional(),

  embedMap: z
    .string()
    .optional(),

  contactPhone: z
    .string()
    .min(11, 'Telefone inválido')
    .max(11)
    .optional(),

  contactEmail: z
    .string()
    .email('Email inválido')
    .optional(),

  contactAddress: z
    .string()
    .max(255)
    .optional(),

  instagram: z
    .string()
    .url('URL do Instagram inválido')
    .optional(),

  facebook: z
    .string()
    .url('URL do Facebook inválido')
    .optional()
});

export type WebsiteType = z.infer<typeof websiteSchema>;