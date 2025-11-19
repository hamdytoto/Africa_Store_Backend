// mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo';

interface SendMailDto {
    to: string;           // recipient email
    subject: string;      // email subject
    html: string;         // HTML content
    text?: string;        // optional plain text
    name?: string;        // optional recipient name
}
@Injectable()
export class MailService {
    private brevoClient: TransactionalEmailsApi;
    constructor() {
        this.brevoClient = new TransactionalEmailsApi();
        this.brevoClient.setApiKey(
            TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY || '',
        );

        if (!process.env.BREVO_API_KEY) {
            throw new Error('BREVO_API_KEY environment variable is missing');
        }
        if (!process.env.MAIL_FROM) {
            throw new Error('MAIL_FROM environment variable is missing');
        }
    }

    async sendMail(mail: SendMailDto) {
        if (!mail.to) throw new Error('Recipient email is required');

        const message: SendSmtpEmail = {
            sender: { name: 'Africa Store', email: process.env.MAIL_FROM }, // verified sender
            to: [{ email: mail.to, name: mail.name }],
            subject: mail.subject,
            htmlContent: mail.html,
            textContent: mail.text, // optional
        };

        try {
            const result = await this.brevoClient.sendTransacEmail(message);
            console.log('✅ Email sent successfully:', result.body);
            return {
                success: true,
                message: 'Email sent successfully',
                data: result.body,
            };
        } catch (error: any) {
            console.error('❌ Email sending failed:', error.response?.body || error);
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to send email',
                details: error.response?.body || error,
            });
        }
    }
}
