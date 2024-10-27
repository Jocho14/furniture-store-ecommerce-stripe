import { IsNumber, IsNotEmpty } from 'class-validator';

export class CartItemDto {
  public constructor(productId: number, quantity: number) {
    this.productId = productId;
    this.quantity = quantity;
  }

  @IsNumber()
  @IsNotEmpty()
  readonly productId!: number;

  @IsNumber()
  @IsNotEmpty()
  readonly quantity!: number;
}
