import { Stripe } from 'stripe';

import { CURRENCY } from 'src/constants/stripe-constants';
import { LineItemDto } from 'src/stripe/DTO/lineItem.dto';

export const createLineItem = (
  item: LineItemDto,
): Stripe.Checkout.SessionCreateParams.LineItem => {
  return {
    price_data: {
      currency: CURRENCY,
      product_data: {
        name: item.name,
        images: item.imageUrls,
        metadata: {
          database_id: item.productId,
        },
      },
      unit_amount: toMinorUnits(item.price),
    },
    quantity: item.quantity,
  };
};

export const createLineItems = (
  item: LineItemDto[],
): Stripe.Checkout.SessionCreateParams.LineItem[] => {
  return item.map(createLineItem);
};

export function toMinorUnits(amount: number): number {
  return amount * 100;
}
