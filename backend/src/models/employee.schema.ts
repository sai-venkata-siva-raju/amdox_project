import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({ timestamps: true, collection: 'employees' })
export class Employee {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  employeeCode: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true, index: true })
  department: string;

  @Prop({ required: true })
  role: string;

  @Prop({ default: 0 })
  salary: number;

  @Prop({ default: null })
  joiningDate?: string | null;

  @Prop({ default: 'Active', index: true })
  status: string;

  @Prop({ default: null, index: true })
  managerId?: string | null;

  @Prop({ default: null })
  phone?: string | null;
}

export const EmployeeSchema = applySchemaTransforms(SchemaFactory.createForClass(Employee));
EmployeeSchema.index({ tenantId: 1, email: 1 }, { unique: true });
