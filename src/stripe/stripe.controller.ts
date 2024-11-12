import { Controller, Post, Body, Get, Query } from '@nestjs/common';
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

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { cartItems: CartItemDto[] }) {
    const { cartItems } = body;
    const productPaymentDetails = await this.fetchProductDetails(
      cartItems.map((item) => item.productId),
    );

    const lineItems = cartItems.map((cartItem) => {
      const productDetail: ProductDetailDto = productPaymentDetails.find(
        (productDetail) => productDetail.productId === cartItem.productId,
      );

      return new LineItemDto(
        cartItem.quantity,
        productDetail.productId,
        productDetail.name,
        productDetail.price,
        productDetail.imageUrls,
      );
    });

    const session = await this.stripeService.createCheckoutSession(lineItems);
    return { clientSecret: session.client_secret };
  }

  @Get('session-status')
  async getSessionStatus(@Query('session_id') sessionId: string) {
    console.log('entered here');
    const session = await this.stripeService.getCheckoutSession(sessionId);
    console.log(session);
    return {
      status: session.payment_status,
      customer_email: session.customer_email || '',
    };
  }

  private async fetchProductDetails(productIds: number[]) {
    const response = await lastValueFrom(
      this.httpService.post(
        `${process.env.BACKEND_URL}/products/payment-details`,
        {
          ids: productIds,
        },
      ),
    );
    return response.data;
  }
}
