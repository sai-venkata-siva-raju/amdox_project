import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: true, collection: 'activities' })
export class Activity {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ default: null, index: true })
  userId?: string | null;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  module: string;

  @Prop({ default: null })
  entityType?: string | null;

  @Prop({ default: null })
  entityId?: string | null;

  @Prop({ default: '' })
  summary: string;
}

export const ActivitySchema = applySchemaTransforms(SchemaFactory.createForClass(Activity));
