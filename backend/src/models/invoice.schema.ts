import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  invoiceNumber: string;

  @Prop({ required: true, index: true })
  counterpartyName: string;

  @Prop({ required: true, index: true })
  type: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ required: true, index: true })
  dueDate: string;

  @Prop({ default: 'pending', index: true })
  status: string;

  @Prop({ default: '' })
  description: string;
}

export const InvoiceSchema = applySchemaTransforms(SchemaFactory.createForClass(Invoice));
InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
