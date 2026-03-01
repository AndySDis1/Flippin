import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().uuid(),
  shop_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  cost: z.number().nullable(),
  status: z.string().nullable(),
  price: z.number().nullable(),
  primary_photo_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
});

export type Item = z.infer<typeof ItemSchema>;

export const AnalyticsSchema = z.object({
  total_items: z.number().default(0),
  listed_items: z.number().default(0),
  sold_items: z.number().default(0),
  gross_revenue: z.number().default(0),
  total_cost: z.number().default(0),
  net_profit: z.number().default(0),
});

export type AnalyticsSummary = z.infer<typeof AnalyticsSchema>;
