import { DiscountType } from 'src/db/models/coupon.model';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CouponRepository } from 'src/db/repos/coupon.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Types } from 'mongoose';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly _couponRepo: CouponRepository) { }

  async create(data: CreateCouponDto) {
    const exists = await this._couponRepo.findByCode(data.code);
    if (exists) throw new BadRequestException('Coupon code already exists');
    const coupon = await this._couponRepo.create({ ...data });
    return { data: coupon, message: 'Coupon created successfully' };
  }

  async findAll() {
    const coupons = await this._couponRepo.findAll();
    return { data: coupons, message: 'Coupons fetched successfully' };
  }

  async findOne(code: string) {
    const coupon = await this._couponRepo.findByCode(code);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return { data: coupon, message: 'Coupon fetched successfully' };
  }

  async update(id: Types.ObjectId, dto: UpdateCouponDto) {
    const updated = await this._couponRepo.update(id, dto);
    if (!updated) throw new NotFoundException('Coupon not found');
    return { message: 'Coupon updated successfully', data: updated };
  }

  async remove(id: Types.ObjectId) {
    const deleted = await this._couponRepo.delete(id);
    if (!deleted) throw new NotFoundException('Coupon not found');
    return { data: [], message: 'Coupon deleted successfully' };
  }

  async validateCoupon(code: string) {
    const coupon = await this._couponRepo.findByCode(code);
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon');
    }
    if (coupon.expiryDate < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    return coupon;
  }

  async applyCoupon(data: ApplyCouponDto) {
    const coupon = await this.validateCoupon(data.code);
    let discout = 0;
    if (coupon.type == DiscountType.PERCENTAGE) {
      discout = data.total * (coupon.value / 100);
    } else {
      discout = coupon.value;
    }
    if (discout > data.total) {
      discout = data.total;
    }
    const finalTotal = data.total - discout;
    return {
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: discout,
        finalTotal
      }, message: 'Coupon applied successfully'
    };
  }
}
