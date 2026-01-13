import type { Product } from '../domain/product';

const now = new Date();

export const testProducts: Product[] = [
  {
    id: 'widget-001',
    name: 'Widget Deluxe',
    description: 'Our flagship widget with polished edges and premium finish.',
    pricePence: 2999,
    updatedAt: new Date('2024-01-05T12:00:00Z'),
  },
  {
    id: 'widget-002',
    name: 'Widget Mini',
    description: 'Compact widget perfect for on-the-go tinkering.',
    pricePence: 1499,
    updatedAt: new Date('2024-02-12T08:30:00Z'),
  },
  {
    id: 'widget-003',
    name: 'Widget Pro Kit',
    description:
      'Bundle featuring the Widget Deluxe, Mini, and accessory pack.',
    pricePence: 4999,
    updatedAt: new Date('2024-03-20T16:45:00Z'),
  },
];
