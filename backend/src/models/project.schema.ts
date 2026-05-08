import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ _id: false })
export class ProjectMilestone {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  dueDate: string;

  @Prop({ default: 'Pending', index: true })
  status: string;
}

@Schema({ _id: false })
export class ProjectTask {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'Medium', index: true })
  priority: string;

  @Prop({ default: 'To Do', index: true })
  status: string;

  @Prop({ default: null, index: true })
  assigneeId?: string | null;

  @Prop({ default: null, index: true })
  milestoneId?: string | null;
}

@Schema({ _id: false })
export class ProjectMember {
  @Prop({ required: true, index: true })
  employeeId: string;

  @Prop({ required: true })
  allocationPct: number;

  @Prop({ required: true })
  role: string;
}

export const ProjectMilestoneSchema = SchemaFactory.createForClass(ProjectMilestone);
export const ProjectTaskSchema = SchemaFactory.createForClass(ProjectTask);
export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);

@Schema({ timestamps: true, collection: 'projects' })
export class Project {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'Planning', index: true })
  status: string;

  @Prop({ required: true, index: true })
  startDate: string;

  @Prop({ required: true, index: true })
  deadline: string;

  @Prop({ default: 0 })
  budgetPlanned: number;

  @Prop({ default: 0 })
  budgetActual: number;

  @Prop({ default: 0 })
  progress: number;

  @Prop({ type: [ProjectMilestoneSchema], default: [] })
  milestones: ProjectMilestone[];

  @Prop({ type: [ProjectTaskSchema], default: [] })
  tasks: ProjectTask[];

  @Prop({ type: [ProjectMemberSchema], default: [] })
  members: ProjectMember[];
}

export const ProjectSchema = applySchemaTransforms(SchemaFactory.createForClass(Project));
