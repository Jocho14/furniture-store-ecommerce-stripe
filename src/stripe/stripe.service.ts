import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LineItemDto } from './DTO/lineItem.dto';
import { createLineItems } from 'src/utils/stripe-utils';
import Stripe from 'stripe';
import { expand } from 'rxjs';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-09-30.acacia',
      },
    );
  }

  async createCheckoutSession(items: LineItemDto[]) {
    const session = await this.stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: createLineItems(items),
      mode: 'payment',
      return_url: `${process.env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      locale: 'en',
    });

    return session;
  }

  async getCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
  }
}
