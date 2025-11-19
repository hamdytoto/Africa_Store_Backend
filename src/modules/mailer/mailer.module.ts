import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: false, // true for port 465
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
          // Add timeouts to prevent hanging
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
          // pool: true, // reuse connection for faster sends
          maxConnections: 3,
          maxMessages: 10,
          tls: {
            rejectUnauthorized: false, // keep false if using Gmail App Password
            // servername: 'smtp.gmail.com',
          },
        },
        defaults: {
          from: `"Africa Store" <${config.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: join(process.cwd(), 'src', 'templates'), // adjusted path
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  exports: [MailerModule],
})
export class CustomMailerModule { }
