import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ timestamps: true, collection: 'tenants' })
export class Tenant {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ default: 'active', index: true })
  status: string;

  @Prop({ default: null })
  domain?: string | null;

  @Prop({
    type: {
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      fiscalYearStart: { type: String, default: '01-01' },
    },
    default: {},
  })
  settings: {
    timezone?: string;
    currency?: string;
    dateFormat?: string;
    fiscalYearStart?: string;
  };
}

export const TenantSchema = applySchemaTransforms(SchemaFactory.createForClass(Tenant));
