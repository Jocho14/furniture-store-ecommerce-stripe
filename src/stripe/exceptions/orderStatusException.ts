import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderStatusException extends HttpException {
  constructor() {
    super('Order is either paid or canceled', HttpStatus.BAD_REQUEST);
  }
}
