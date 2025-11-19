import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, IsBoolean, Matches } from 'class-validator';
import { IsFutureDate } from 'src/common/decorators/validation/is-future-date.decerator';
import { DiscountType } from 'src/db/models/coupon.model';

export class CreateCouponDto {
    @IsString()
    code: string;

    @IsEnum(DiscountType)
    @IsOptional()
    type: DiscountType;

    @IsNumber()
    value: number;

    @IsFutureDate({
        message: 'expiryDate must be in the future',
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'expiryDate must be in format YYYY-MM-DD',
    })
    @IsOptional()
    expiryDate: string;

    @IsOptional()
    @IsNumber()
    maxUsage?: number;

    @IsOptional()
    @IsString()
    description?: string;
}
