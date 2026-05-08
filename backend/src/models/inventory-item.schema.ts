import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type InventoryItemDocument = HydratedDocument<InventoryItem>;

@Schema({ timestamps: true, collection: 'inventory_items' })
export class InventoryItem {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'General', index: true })
  category: string;

  @Prop({ default: 0 })
  unitPrice: number;

  @Prop({ default: 0 })
  quantityOnHand: number;

  @Prop({ default: 0 })
  reorderPoint: number;

  @Prop({ default: null })
  warehouseLocation?: string | null;

  @Prop({ default: null, index: true })
  vendorId?: string | null;
}

export const InventoryItemSchema = applySchemaTransforms(SchemaFactory.createForClass(InventoryItem));
InventoryItemSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
