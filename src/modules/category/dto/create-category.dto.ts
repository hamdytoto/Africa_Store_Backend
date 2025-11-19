import { IsRequiredString } from "src/common/decorators/validation/is-required-string.decorator";

export class CreateCategoryDto {
    @IsRequiredString()
    name: string
}
