import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type KpiMetricDocument = HydratedDocument<KpiMetric>;

@Schema({ timestamps: true, collection: 'kpi_metrics' })
export class KpiMetric {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  metricKey: string;

  @Prop({ required: true })
  metricValue: number;

  @Prop({ required: true })
  label: string;

  @Prop({ default: null, index: true })
  period?: string | null;
}

export const KpiMetricSchema = applySchemaTransforms(SchemaFactory.createForClass(KpiMetric));
