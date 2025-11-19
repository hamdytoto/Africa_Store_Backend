import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
    thumbnail?: any;

    @IsOptional()
    images?: any[];
    
    @IsOptional()
    @IsMongoId()
    category?: Types.ObjectId;
}
