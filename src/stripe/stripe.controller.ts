import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { HttpService } from '@nestjs/axios';
import { CartItemDto } from './DTO/cartItem.dto';
import { ProductDetailDto } from './DTO/productDetail.dto';
import { lastValueFrom } from 'rxjs';
import { LineItemDto } from './DTO/lineItem.dto';

@Controller('Checkout')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private readonly httpService: HttpService,
  ) {}

  @Post('create-checkout-session/:id')
  async createCheckoutSession(@Param('id') id: number) {
    const session = await this.stripeService.createCheckoutSession(id);
    return { clientSecret: session.client_secret };
  }

  @Get('session-status')
  async getSessionStatus(@Query('session_id') sessionId: string) {
    const session = await this.stripeService.getCheckoutSession(sessionId);
    await this.stripeService.setSessionResult(session);
    return {
      status: session.payment_status,
      customer_email: session.customer_email || '',
    };
  }
}
