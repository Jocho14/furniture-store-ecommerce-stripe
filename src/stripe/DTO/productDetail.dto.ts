import { IsNumber, IsNotEmpty, IsString, IsArray } from 'class-validator';

export class ProductDetailDto {
  public constructor(
    productId: number,
    name: string,
    price: number,
    imageUrls: string[],
  ) {
    this.productId = productId;
    this.name = name;
    this.price = price;
    this.imageUrls = imageUrls;
  }

  @IsNumber()
  @IsNotEmpty()
  readonly productId!: number;

  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsNumber()
  @IsNotEmpty()
  readonly price!: number;

  @IsArray()
  readonly imageUrls!: string[];
}
