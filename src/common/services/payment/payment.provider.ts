import { ConfigService } from '@nestjs/config';
import { STRIPE_CLIENT } from "src/common/constants/constants";
import Stripe from "stripe";

export const StripeProvider = {
    provide: STRIPE_CLIENT,
    useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY')!);
    },

    inject: [ConfigService]
}