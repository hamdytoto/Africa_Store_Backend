import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers, Res, Req, HttpCode } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CurrentUser } from 'src/common/decorators/auth/currentUser.decorator';
import type { UserDocument } from 'src/db/models/user.model';
import { Roles } from 'src/common/decorators/auth/roles.decorator';
import { Role } from 'src/db/enums/user.enum';
import { Types } from 'mongoose';
import { ObjectIdValidationPipe } from 'src/common/pipes/objectid-validation.pipe';
import { OrderStatus } from 'src/db/models/order.model';
import { Public } from 'src/common/decorators/auth/public.decorator';
import type { Request, Response } from 'express';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }
  @Roles(Role.user)
  @Post()
  async create(@Body() data: CreateOrderDto, @CurrentUser() user: UserDocument) {
    return this.orderService.create(data, user);
  }
  @Post("/webhook")
  @HttpCode(200)
  @Public()
  async stripeWebhook(@Req() req: Request, @Res() res: Response, @Headers('stripe-signature') signature: string) {
    const rawBody = req.body; // Must be a Buffer set by express.raw middleware

    try {
      await this.orderService.stripeWebhook(rawBody, signature);
      res.json({ received: true });
    } catch (err) {
      console.error('Stripe Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  @Get()
  @Roles(Role.admin, Role.user)
  async findAll(@CurrentUser() user: UserDocument, @Query() query: any) {
    return this.orderService.findAll(user, query);
  }

  @Roles(Role.admin)
  @Get(':orderId')
  findOne(@Param('orderId', ObjectIdValidationPipe) orderId: Types.ObjectId,
    @CurrentUser('_id') userId: Types.ObjectId) {
    return this.orderService.findOne(orderId, userId);
  }

  @Roles(Role.admin)
  @Patch(':orderId')
  update(@Param('orderId', ObjectIdValidationPipe) orderId: Types.ObjectId, @Body('') updatedData: UpdateOrderDto) {
    return this.orderService.update(orderId, updatedData);
  }

  @Roles(Role.admin)
  @Delete(':orderId')
  remove(@Param('orderId', ObjectIdValidationPipe) orderId: Types.ObjectId) {
    return this.orderService.remove(orderId);
  }

  @Roles(Role.admin)
  @Patch(':orderId/status')
  async changeStatus(@Param('orderId', ObjectIdValidationPipe) orderId: Types.ObjectId
    , @Body('status') status: OrderStatus) {
    return await this.orderService.changeStatus(orderId, status);
  }
}
