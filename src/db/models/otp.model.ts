import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { hash } from "src/common/security/hash.util";

@Schema({ timestamps: true })
export class Otp {
    @Prop({ required: true, type: String })
    code: string
    @Prop({ required: true, type: String, unique: true, lowercase: true })
    handle: string
    @Prop({ type: Object, required: false })
    userData: Record<string, any>;
}

export const OTPSchema = SchemaFactory.createForClass(Otp)

OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 })

OTPSchema.pre('save', function (next) {
    if (this.isModified("code")) {
        this.code = hash(this.code)
    }
    return next();
})

export const OtpModelName = Otp.name

export const OtpModel = MongooseModule.forFeature([{
    name: OtpModelName,
    schema: OTPSchema
}])

export type OtpDocument = HydratedDocument<Otp>