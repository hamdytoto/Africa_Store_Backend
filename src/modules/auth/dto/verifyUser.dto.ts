import { IsEmail  } from "class-validator"
import { IsRequiredString } from "src/common/decorators/validation/is-required-string.decorator"

export class VerifyUserDto {
    @IsEmail()
    @IsRequiredString()
    handle:string 
    @IsRequiredString()
    code:string
}