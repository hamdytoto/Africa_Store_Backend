import { IsOptional } from "class-validator";
import type { Image } from "src/common/types/image.type";

export class updateProfileDto {
    @IsOptional()
    name?: string;
    @IsOptional()
    phone?: string;
    @IsOptional()
    avatar?: Image;
}