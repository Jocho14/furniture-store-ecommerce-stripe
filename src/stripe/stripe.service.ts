import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>(process.env.STRIPE_SECRET_KEY),
      {
        apiVersion: '2024-09-30.acacia',
      },
    );
  }

  async createPaymentIntent(amount: number, currency: string) {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }
}
