import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ApplyCouponDto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsNumber()
    total: number; // total before discount
}
