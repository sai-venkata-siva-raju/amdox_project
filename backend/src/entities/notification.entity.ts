import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Profile } from '../profiles/profile.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant, tenant => tenant.notifications)
  tenant: Tenant;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Profile)
  user: Profile;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', default: '' })
  message: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
