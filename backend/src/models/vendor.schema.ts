import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type VendorDocument = HydratedDocument<Vendor>;

@Schema({ timestamps: true, collection: 'vendors' })
export class Vendor {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  contactName?: string | null;

  @Prop({ default: null, lowercase: true, index: true })
  email?: string | null;

  @Prop({ default: null })
  phone?: string | null;

  @Prop({ default: null })
  address?: string | null;

  @Prop({ default: 'Active', index: true })
  status: string;

  @Prop({ default: 0 })
  rating: number;
}

export const VendorSchema = applySchemaTransforms(SchemaFactory.createForClass(Vendor));
