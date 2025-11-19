import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponModelName, CouponDocument } from '../models/coupon.model';
import { CreateCouponDto } from 'src/modules/coupon/dto/create-coupon.dto';
import { UpdateCouponDto } from 'src/modules/coupon/dto/update-coupon.dto';

@Injectable()
export class CouponRepository {
    constructor(@InjectModel(CouponModelName) private readonly model: Model<CouponDocument>) { }

    async create(data: CreateCouponDto) {
        return await this.model.create(data);
    }

    async findAll(filter = {}) {
        return await this.model.find(filter).sort({ createdAt: -1 });
    }

    async findByCode(code: string) {
        return await this.model.findOne({ code });
    }

    async update(id: Types.ObjectId, data: UpdateCouponDto) {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: Types.ObjectId) {
        return await this.model.findByIdAndDelete(id);
    }
}
