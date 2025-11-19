import { IsEmail} from "class-validator"
import { IsRequiredString } from "src/common/decorators/validation/is-required-string.decorator"
import { IsStrongPassword } from "src/common/decorators/validation/is-strong-password.decorator"

export class LoginDto{
    @IsRequiredString()
    @IsEmail()
    email:string
    @IsStrongPassword()
    @IsRequiredString()
    password:string

}