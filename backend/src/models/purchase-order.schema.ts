import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type PurchaseOrderDocument = HydratedDocument<PurchaseOrder>;

@Schema({ _id: false })
export class PurchaseOrderItem {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  unitPrice: number;
}

export const PurchaseOrderItemSchema = SchemaFactory.createForClass(PurchaseOrderItem);

@Schema({ timestamps: true, collection: 'purchase_orders' })
export class PurchaseOrder {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  orderNumber: string;

  @Prop({ required: true, index: true })
  vendorId: string;

  @Prop({ required: true })
  vendorName: string;

  @Prop({ default: 'pending', index: true })
  status: string;

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ required: true, index: true })
  orderDate: string;

  @Prop({ default: null, index: true })
  expectedDelivery?: string | null;

  @Prop({ type: [PurchaseOrderItemSchema], default: [] })
  items: PurchaseOrderItem[];
}

export const PurchaseOrderSchema = applySchemaTransforms(SchemaFactory.createForClass(PurchaseOrder));
PurchaseOrderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });
