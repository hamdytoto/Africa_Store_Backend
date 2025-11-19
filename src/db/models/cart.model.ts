import { MongooseModule, Prop, raw, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, HydrateOptions, ObjectId, Types } from "mongoose";
import { UserModelName } from "./user.model";
import type { Image } from "src/common/types/image.type";
import slugify from "slugify";
import { FileUploadService } from "src/common/services/fileupload/fileupload.service";
import { ConfigService } from "@nestjs/config";
import { FileUploadModule } from "src/common/services/fileupload/fileupload.module";
import { productModelName } from "./product.model";

@Schema({
    timestamps: true,

})
export class Cart {
    @Prop({ required: true, type: Types.ObjectId, ref: UserModelName })
    user: Types.ObjectId
    @Prop([{ productId: { type: Types.ObjectId, ref: productModelName, required: true }, quantity: { type: Number, default: 1 }, price: { type: Number }, productSize: { type: String } }])
    products: {
        productId: Types.ObjectId,
        quantity: number,
        price: number,
        productSize: string
        _id?: Types.ObjectId
    }[];

}
export const CartSchema = SchemaFactory.createForClass(Cart)



export const CartModelName = Cart.name;

export const CartModel = MongooseModule.forFeature([{
    name: CartModelName,
    schema: CartSchema
}])

export type CartDocument = HydratedDocument<Cart>

