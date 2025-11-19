import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


export enum DiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

@Schema({ timestamps: true })
export class Coupon {
    @Prop({ required: true, unique: true })
    code: string; // e.g., "BLACKFRIDAY10"

    @Prop({ type: String, enum: DiscountType, default: DiscountType.PERCENTAGE })
    type: DiscountType; // % or fixed amount

    @Prop({ required: true })
    value: number; // e.g., 10 = 10% or $10 off

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Date })
    expiryDate: Date;

    @Prop({ type: Number, default: 0 })
    usageCount: number;

    @Prop({ type: Number, default: 0 })
    maxUsage: number; // e.g., 100 = can be used 100 times

    @Prop({ type: String })
    description?: string;
}
export const CouponModelName = Coupon.name;
export type CouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = SchemaFactory.createForClass(Coupon);
export const CouponModel = MongooseModule.forFeature([{
    name: CouponModelName,
    schema: CouponSchema
}])
