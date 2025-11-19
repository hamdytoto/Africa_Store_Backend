import { PaymentMethod } from './../../../db/models/order.model';
import { IsEnum, IsOptional, IsString } from "class-validator";
import { IsRequiredString } from "src/common/decorators/validation/is-required-string.decorator";
export class CreateOrderDto {
    @IsRequiredString()
    phone: string;

    @IsRequiredString()
    username: string

    @IsRequiredString()
    address: string;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
    
    @IsOptional()
    @IsString()
    couponCode?: string;
} 
