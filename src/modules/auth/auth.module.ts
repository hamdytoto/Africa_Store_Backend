import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { OtpRepository } from 'src/db/repos/otp.repository';
import { OtpModel } from 'src/db/models/otp.model';
import { TokenRepository } from 'src/db/repos/token.repository';
import { tokenModel } from 'src/db/models/token.model';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { ResendMailService } from '../mailer/resend-mail.service';
import { CartModule } from '../cart/cart.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [UserModule, OtpModel, tokenModel, CartModule],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtService, OtpRepository, TokenRepository, ResendMailService, {
    provide: APP_GUARD,  // global 
    useClass: AuthGuard
  }, {
      provide: APP_GUARD,  // global 
      useClass: AuthorizationGuard
    }],
})
export class AuthModule { }
