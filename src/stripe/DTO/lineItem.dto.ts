import { IsNumber, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ProductDetailDto } from './productDetail.dto';

export class LineItemDto extends ProductDetailDto {
  public constructor(
    quantity: number,
    productId: number,
    name: string,
    price: number,
    imageUrls: string[],
  ) {
    super(productId, name, price, imageUrls);
    this.quantity = quantity;
  }

  @IsNumber()
  @IsNotEmpty()
  readonly quantity!: number;
}
