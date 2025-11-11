import type { Deal } from '../api/deals'

export const sampleDeals: Deal[] = [
  {
    storeIdDate: 'aldi-20241105',
    storeId: 'aldi',
    storeName: 'Aldi',
    date: '20241105',
    productId: 'organic-gala-apple-3lb',
    productName: 'Organic Gala Apples (3 lb bag)',
    sizeText: 'Produce • 3 lb bag',
    unitPrice: 4.99,
    promoPrice: 3.49,
    promoEnds: '2024-11-12',
    sourceUrl: null
  },
  {
    storeIdDate: 'target-20241105',
    storeId: 'target',
    storeName: 'Target',
    date: '20241105',
    productId: 'goodgather-sourdough',
    productName: 'Good & Gather Artisan Sourdough Loaf',
    sizeText: 'Bakery • 1 lb loaf',
    unitPrice: 5.49,
    promoPrice: 3.99,
    promoEnds: '2024-11-10',
    sourceUrl: null
  },
  {
    storeIdDate: 'safeway-20241105',
    storeId: 'safeway',
    storeName: 'Safeway',
    date: '20241105',
    productId: 'signature-baby-spinach',
    productName: 'Signature Farms Baby Spinach',
    sizeText: 'Produce • 10 oz clamshell',
    unitPrice: 4.29,
    promoPrice: 2.99,
    promoEnds: '2024-11-14',
    sourceUrl: null
  },
  {
    storeIdDate: 'kroger-20241105',
    storeId: 'kroger',
    storeName: 'Kroger',
    date: '20241105',
    productId: 'simpletruth-greek-yogurt',
    productName: 'Simple Truth Organic Greek Yogurt',
    sizeText: 'Dairy • 24 oz tub',
    unitPrice: 6.49,
    promoPrice: 4.49,
    promoEnds: '2024-11-13',
    sourceUrl: null
  }
]

