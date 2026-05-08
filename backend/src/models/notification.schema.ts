import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ default: null, index: true })
  userId?: string | null;

  @Prop({ required: true, index: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, index: true })
  module: string;

  @Prop({ default: false, index: true })
  read: boolean;

  @Prop({ default: 'in-app' })
  channel: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const NotificationSchema = applySchemaTransforms(SchemaFactory.createForClass(Notification));
