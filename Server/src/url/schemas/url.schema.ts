import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type UrlDocument = Url & Document;

@Schema({ timestamps: true })
export class Url {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  originalUrl!: string;

  @Prop({ required: true, unique: true, index: true })
  shortCode!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  user!: Types.ObjectId;

  @Prop({ default: 0 })
  clicks!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
