import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { StripeProvider } from "./payment.provider";

@Module({
    providers: [PaymentService, StripeProvider],
    exports: [PaymentService]
})   
export class PaymentModule {}