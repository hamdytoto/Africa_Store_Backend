import { MongooseModule, Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Role } from "../enums/user.enum"
import { HydratedDocument } from "mongoose"
import { hash } from "src/common/security/hash.util"
import { Types } from "mongoose"
import { productModelName } from "./product.model"
import type { Image } from "src/common/types/image.type"

// schema class 
@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, type: String })
    name: string

    @Prop({ required: true, unique: true, type: String, lowercase: true })
    email: string

    @Prop({ required: false, type: String, default: "0100200300" })
    phone: string

    @Prop({ required: true, type: String })
    password: string

    @Prop({ type: Boolean, default: false })
    accoutAcctivated: boolean

    @Prop({ required: true, enum: Role, default: Role.user })
    role: Role

    @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
    favorites: Types.ObjectId[];

    @Prop({
        type: raw({ secure_url: { type: String }, public_id: { type: String } }),
        default: {
            secure_url: 'https://res.cloudinary.com/dheffyjlk/image/upload/v1739782974/xu3ltoptgjv2nylegwxh.png',
            public_id: ''
        }
    })
    avatar: Image;



}

export const userSchema = SchemaFactory.createForClass(User)

userSchema.pre('save', function (next) {
    if (this.isModified("password")) {
        this.password = hash(this.password)
    }
    return next();
}
)
export const UserModelName = User.name



// model 
export const UserModel = MongooseModule.forFeature([{
    name: UserModelName,
    schema: userSchema
}])


// userdoucment   (type)
export type UserDocument = HydratedDocument<User>