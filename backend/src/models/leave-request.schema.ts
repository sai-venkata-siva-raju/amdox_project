import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>;

@Schema({ timestamps: true, collection: 'leave_requests' })
export class LeaveRequest {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  employeeId: string;

  @Prop({ required: true, index: true })
  leaveType: string;

  @Prop({ required: true, index: true })
  startDate: string;

  @Prop({ required: true, index: true })
  endDate: string;

  @Prop({ default: 'pending', index: true })
  status: string;

  @Prop({ default: '' })
  reason: string;
}

export const LeaveRequestSchema = applySchemaTransforms(SchemaFactory.createForClass(LeaveRequest));
