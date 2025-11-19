import { PartialType } from '@nestjs/mapped-types';
import { AddToCartDto } from './add-to-cart.dto';
import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';

export class UpdateCartDto extends PartialType(AddToCartDto) {
    @IsMongoId()
    _id: Types.ObjectId
}
