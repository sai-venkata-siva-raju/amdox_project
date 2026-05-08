import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ default: null, index: true })
  userId?: string | null;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  module: string;

  @Prop({ default: null })
  entityType?: string | null;

  @Prop({ default: null })
  entityId?: string | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ default: '' })
  hash: string;
}

export const AuditLogSchema = applySchemaTransforms(SchemaFactory.createForClass(AuditLog));
