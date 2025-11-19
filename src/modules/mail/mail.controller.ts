// src/mail/mail.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/common/decorators/auth/public.decorator';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }
    @Public()
    @Post('test')
    async sendTestEmail(
        @Body('to') to: string,
        @Body('subject') subject: string,
        @Body('html') html: string,
    ) {
        return this.mailService.sendMail({
            to,
            subject,
            html,
        });
    }
}
