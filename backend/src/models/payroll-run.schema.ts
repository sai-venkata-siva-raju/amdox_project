import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type PayrollRunDocument = HydratedDocument<PayrollRun>;

@Schema({ timestamps: true, collection: 'payroll_runs' })
export class PayrollRun {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  month: string;

  @Prop({ default: 'Draft', index: true })
  status: string;

  @Prop({ default: 0 })
  totalGross: number;

  @Prop({ default: 0 })
  totalDeductions: number;

  @Prop({ default: 0 })
  totalNet: number;

  @Prop({ default: null })
  processedAt?: Date | null;
}

export const PayrollRunSchema = applySchemaTransforms(SchemaFactory.createForClass(PayrollRun));
