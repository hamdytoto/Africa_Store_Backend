import { IsNumber, Max, Min, IsOptional, IsInt, IsNotEmpty, IsNotEmptyObject, IsDefined, IsArray, ArrayNotEmpty, IsEnum, IsMongoId } from "class-validator";
import { Transform, Type } from "class-transformer";
import { IsRequiredString } from "src/common/decorators/validation/is-required-string.decorator";
import { ProductSizes } from "src/db/models/product.model";
import { Types } from "mongoose";

export class CreateProductDto {
  @IsRequiredString()
  name: string;

  @IsRequiredString()
  description: string;

  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stock: number;

  @IsOptional()
  slug: string;

  @IsRequiredString()
  club: string;

  @Transform(({ value }) => {
    try {
      // Handle both ["S","M"] and multiple form fields ["S", "M"]
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return JSON.parse(value);
      return [];
    } catch {
      return [];
    }
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Sizes Array should not be empty' })
  @IsEnum(ProductSizes, { each: true })
  sizes: ProductSizes[];

  @IsMongoId()
  category: Types.ObjectId;
}
