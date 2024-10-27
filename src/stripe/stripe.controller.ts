import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
}

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    const paymentIntent = await this.stripeService.createPaymentIntent(
      body.amount,
      body.currency,
    );
    return {
      clientSecret: paymentIntent.client_secret,
    };
  }
}
