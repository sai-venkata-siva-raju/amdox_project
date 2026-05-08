import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type CompanySettingsDocument = HydratedDocument<CompanySettings>;

@Schema({ timestamps: true, collection: 'company_settings' })
export class CompanySettings {
  @Prop({ required: true, unique: true, index: true })
  tenantId: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'MM/DD/YYYY' })
  dateFormat: string;

  @Prop({ default: '01-01' })
  fiscalYearStart: string;

  @Prop({ default: null })
  logoUrl?: string | null;
}

export const CompanySettingsSchema = applySchemaTransforms(SchemaFactory.createForClass(CompanySettings));
