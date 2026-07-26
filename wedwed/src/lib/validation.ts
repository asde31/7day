import { z } from 'zod';

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined));

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
});

export const vendorCreateSchema = z.object({
  categoryId: z.string().min(1).max(64),
  name: z.string().trim().min(1, 'Укажите название').max(120),
  description: optionalTrimmed(2000),
  city: optionalTrimmed(80),
  address: optionalTrimmed(200),
  capacity: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  priceFrom: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  phone: optionalTrimmed(40),
  telegram: optionalTrimmed(80),
  instagram: optionalTrimmed(80),
  whatsapp: optionalTrimmed(40),
  website: z.string().trim().url().max(300).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const vendorUpdateSchema = vendorCreateSchema.partial().extend({
  categoryId: z.string().min(1).max(64).optional(),
});

export const categoryCreateSchema = z.object({
  title: z.string().trim().min(1).max(80),
  subtitle: optionalTrimmed(160),
  emoji: z.string().trim().max(8).optional().or(z.literal('')).transform((v) => (v ? v : '💍')),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Только латиница, цифры и дефис')
    .min(1)
    .max(60)
    .optional(),
});

export const categoryUpdateSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  subtitle: optionalTrimmed(160),
  emoji: z.string().trim().max(8).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const reorderSchema = z.object({
  // Полный упорядоченный список id внутри одного блока (или блоков).
  ids: z.array(z.string().min(1).max(64)).min(1).max(2000),
});

export type VendorCreate = z.infer<typeof vendorCreateSchema>;
export type VendorUpdate = z.infer<typeof vendorUpdateSchema>;
