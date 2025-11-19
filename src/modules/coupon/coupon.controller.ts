import { Controller, Post, Get, Param, Body, Patch, Delete, applyDecorators } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles } from 'src/common/decorators/auth/roles.decorator';
import { Role } from 'src/db/enums/user.enum';
import { Types } from 'mongoose';
import { ObjectIdValidationPipe } from 'src/common/pipes/objectid-validation.pipe';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Controller('coupons')
@Roles(Role.admin)
export class CouponController {
  constructor(private readonly _couponService: CouponService) { }

  @Post()
  async create(@Body() dto: CreateCouponDto) {
    return await this._couponService.create(dto);
  }
  @Roles(Role.user)
  @Post('apply')
  async applyCoupon(@Body() dto: ApplyCouponDto) {
    return await this._couponService.applyCoupon(dto);
  }

  @Get()
  async findAll() {
    return await this._couponService.findAll();
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return await this._couponService.findOne(code);
  }

  @Patch(':id')
  async update(@Param('id', ObjectIdValidationPipe) id: Types.ObjectId, @Body() dto: UpdateCouponDto) {
    return await this._couponService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ObjectIdValidationPipe) id: Types.ObjectId) {
    return await this._couponService.remove(id);
  }

}
