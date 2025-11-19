import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponRepository } from 'src/db/repos/coupon.repository';
import { CouponModel} from 'src/db/models/coupon.model';

@Module({
  controllers: [CouponController],
  providers: [CouponService , CouponRepository],
  exports: [CouponService, CouponRepository],
  imports: [CouponModel]
})
export class CouponModule { }
