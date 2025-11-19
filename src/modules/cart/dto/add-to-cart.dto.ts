import { IsEnum, IsMongoId, IsNumber, Min } from "class-validator";
import { Types } from "mongoose";
import { ProductSizes } from "src/db/models/product.model";

export class AddToCartDto {
    @IsMongoId()
    productId: Types.ObjectId
    @IsNumber()
    @Min(1)
    quantity: number

    @IsEnum(ProductSizes)
    productSize:ProductSizes

}
