export type Product = { short: string; name: string; icon: string; headline: string; sub: string; features: [string, string][] }

// Only the restaurant product is live. Others are parked in ../../other-products-later
export const PRODUCTS: Record<'restaurant', Product> = {
  restaurant: {
    short: 'Restaurant', name: 'Restaurant management software', icon: '🍽️',
    headline: 'Tap, order, serve, paid. No app for your guests.',
    sub: 'QR and NFC ordering, kitchen display, billing and delivery-app orders together.',
    features: [
      ['QR & NFC ordering', 'Guests order from the browser at the table.'],
      ['Kitchen display', 'Timed tickets with allergy warnings.'],
      ['Floor & requests', 'Call waiter, water and bill requests live.'],
      ['Split bill & UPI', 'Equal split and tips at checkout.'],
      ['Menu & inventory', 'Stock counts and automatic sold-out.'],
      ['Delivery-app orders', 'Swiggy, Zomato, ONDC and phone orders in one queue.'],
      ['Loyalty & feedback', 'Rewards and private low-rating alerts.'],
      ['Staff roles & reports', 'Permissions and sales summaries.'],
    ],
  },
}
