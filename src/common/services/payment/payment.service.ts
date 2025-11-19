import { PaymentMethod } from './../../../db/models/order.model';
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { STRIPE_CLIENT } from "src/common/constants/constants";
import Stripe from "stripe";

@Injectable()
export class PaymentService {
    constructor(@Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
        private readonly configService: ConfigService
    ) { }

    // checkout session  ,,,,,, payment intent           ,, working on checkout session 
    async createCheckoutSession({
        line_items, metadata, discounts, customer_email
    }: Stripe.Checkout.SessionCreateParams) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: 'payment',
            line_items,
            customer_email,
            discounts,
            success_url: this.configService.get<string>('SUCCESS_URL')!,
            cancel_url: this.configService.get<string>('CANCEL_URL')!,
            metadata
        })

        return session
    }

    async createCoupon({ currency, percent_off }: Stripe.CouponCreateParams) {
        return this.stripe.coupons.create({
            currency,
            percent_off
        })
    }

    async createEvents(rawBody: Buffer, signature: string): Promise<Stripe.Event> {
        return this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!
        );
    }

}