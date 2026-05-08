import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { applySchemaTransforms } from './schema.utils';

export type JournalEntryDocument = HydratedDocument<JournalEntry>;

@Schema({ _id: false })
export class JournalLine {
  @Prop({ required: true })
  accountId: string;

  @Prop({ default: null })
  accountCode?: string | null;

  @Prop({ default: null })
  accountName?: string | null;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 0 })
  debit: number;

  @Prop({ default: 0 })
  credit: number;
}

export const JournalLineSchema = SchemaFactory.createForClass(JournalLine);

@Schema({ timestamps: true, collection: 'journal_entries' })
export class JournalEntry {
  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  entryNumber: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  entryDate: string;

  @Prop({ required: true, index: true })
  period: string;

  @Prop({ default: false, index: true })
  isPosted: boolean;

  @Prop({ type: [JournalLineSchema], default: [] })
  lines: JournalLine[];

  @Prop({ required: true, index: true })
  createdBy: string;
}

export const JournalEntrySchema = applySchemaTransforms(SchemaFactory.createForClass(JournalEntry));
JournalEntrySchema.index({ tenantId: 1, entryNumber: 1 }, { unique: true });
