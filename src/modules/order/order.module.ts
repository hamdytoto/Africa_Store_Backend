import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { OrderRepository } from 'src/db/repos/order.repository';
import { OrderModel } from 'src/db/models/order.model';
import { PaymentModule } from 'src/common/services/payment/payment.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepository,],
  imports: [CartModule, ProductModule, OrderModel, PaymentModule,CouponModule],
})
export class OrderModule { }
