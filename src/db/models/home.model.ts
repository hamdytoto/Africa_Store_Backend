import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import type { Image } from 'src/common/types/image.type';
import { productModelName } from './product.model';

@Schema({ timestamps: true })
export class Home extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, type: Types.ObjectId, ref: productModelName })
    product: Types.ObjectId

    @Prop({ required: true })
    club: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    season: string;

    @Prop({
        type: Object,
        required: true,
        default: {
            public_id: '',
            secure_url: 'https://res.cloudinary.com/demo/image/upload/v123456789/default.png',
        },
    })
    image: Image;

}

export const HomeSchema = SchemaFactory.createForClass(Home);
export const HomeModelName = Home.name;
export const HomeModel = MongooseModule.forFeature([{
    name: HomeModelName,
    schema: HomeSchema
}])
export type HomeDocument = HydratedDocument<Home>
