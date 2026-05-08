import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type ChartOfAccountDocument = HydratedDocument<ChartOfAccount>;

@Schema({ timestamps: true, collection: 'chart_of_accounts' })
export class ChartOfAccount {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  accountCode: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ required: true, index: true })
  accountType: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: null, index: true })
  parentAccountId?: string | null;
}

export const ChartOfAccountSchema = applySchemaTransforms(SchemaFactory.createForClass(ChartOfAccount));
ChartOfAccountSchema.index({ tenantId: 1, accountCode: 1 }, { unique: true });
