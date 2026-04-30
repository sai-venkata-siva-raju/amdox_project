import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Profile } from '../profiles/profile.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant, tenant => tenant.activities)
  tenant: Tenant;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @ManyToOne(() => Profile)
  user: Profile;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text', default: 'General' })
  module: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
