import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Profile } from '../profiles/profile.entity';
import { KpiMetric } from './kpi-metric.entity';
import { Activity } from './activity.entity';
import { Notification } from './notification.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => Profile, 'tenant_id')
  profiles: Profile[];

  @OneToMany(() => KpiMetric, kpi => kpi.tenant)
  kpi_metrics: KpiMetric[];

  @OneToMany(() => Activity, activity => activity.tenant)
  activities: Activity[];

  @OneToMany(() => Notification, notification => notification.tenant)
  notifications: Notification[];
}
