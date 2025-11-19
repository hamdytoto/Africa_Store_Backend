import { IsEmail } from 'class-validator';
import { IsRequiredString } from 'src/common/decorators/validation/is-required-string.decorator';
import { IsStrongPassword } from 'src/common/decorators/validation/is-strong-password.decorator';
import { Match } from 'src/common/decorators/validation/match.decorator';
export class ResetPasswordDto {
    @IsEmail()
    @IsRequiredString()
    handle: string;

    @IsRequiredString()
    code: string;

    @IsRequiredString()
    @IsStrongPassword()
    password: string;

    @IsRequiredString()
    @Match('password', { message: 'Passwords must match!' })
    password_confirmation: string
}