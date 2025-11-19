import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomMailerModule } from './modules/mailer/mailer.module';
import { CategoryModule } from './modules/category/category.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ProductModule } from './modules/product/product.module';
import { ResendMailModule } from './modules/mailer/resend-mail.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { MailModule } from './modules/mail/mail.module';
import { HomeModule } from './modules/home/home.module';
import { CouponModule } from './modules/coupon/coupon.module';


@Module({
  imports: [UserModule, AuthModule , ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')
      })
    }), CustomMailerModule, CategoryModule, ProductModule , ResendMailModule, CartModule, OrderModule,MailModule, HomeModule, CouponModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

