import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LineItemDto } from './DTO/lineItem.dto';
import { createLineItems } from 'src/utils/stripe-utils';
import Stripe from 'stripe';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ProductDetailDto } from './DTO/productDetail.dto';
import { OrderStatusException } from './exceptions/orderStatusException';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-09-30.acacia',
      },
    );
  }

  async createCheckoutSession(orderId: number) {
    const order = await this.getOrder(orderId);

    if (order.status !== 'pending') {
      throw new OrderStatusException();
    }

    const cartItems = await this.getCartItems(orderId);

    const productPaymentDetails = await this.fetchProductDetails(
      cartItems.map((item) => item.product_id),
    );

    const customerEmail =
      order.guest_id !== null
        ? await this.getGuestEmail(orderId)
        : await this.getClientEmail(orderId);

    const lineItems = cartItems.map((cartItem) => {
      const productDetail: ProductDetailDto = productPaymentDetails.find(
        (productDetail) => productDetail.productId === cartItem.product_id,
      );

      return new LineItemDto(
        cartItem.quantity,
        productDetail.productId,
        productDetail.name,
        cartItem.product_price,
        productDetail.imageUrls,
      );
    });

    const session = await this.stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      customer_email: customerEmail,
      line_items: createLineItems(lineItems),
      mode: 'payment',
      return_url: `${process.env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      locale: 'en',
      metadata: {
        order_id: orderId.toString(),
      },
    });

    return session;
  }

  async getCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
  }

  async fetchProductDetails(productIds: number[]) {
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

  async getOrder(orderId: number) {
    const response = await lastValueFrom(
      this.httpService.get(`${process.env.BACKEND_URL}/orders/${orderId}`),
    );
    return response.data;
  }

  async getCartItems(orderId: number) {
    const response = await lastValueFrom(
      this.httpService.get(
        `${process.env.BACKEND_URL}/orders/${orderId}/products`,
      ),
    );
    return response.data;
  }

  async getGuestEmail(orderId: number) {
    const response = await lastValueFrom(
      this.httpService.get(
        `${process.env.BACKEND_URL}/orders/${orderId}/guest-email`,
      ),
    );
    return response.data;
  }

  async getClientEmail(orderId: number) {
    const response = await lastValueFrom(
      this.httpService.get(
        `${process.env.BACKEND_URL}/orders/${orderId}/client-email`,
      ),
    );
    return response.data;
  }

  async setSessionResult(session: any) {
    if (session.payment_status === 'paid') {
      const response = await lastValueFrom(
        this.httpService.post(
          `${process.env.BACKEND_URL}/orders/${session.metadata.order_id}/complete`,
          {},
        ),
      );
      return response.data;
    }
  }
}
