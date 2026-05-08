import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('kpi_metrics')
export class KpiMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant, tenant => tenant.kpi_metrics)
  tenant: Tenant;

  @Column({ type: 'text' })
  metric_key: string;

  @Column({ type: 'numeric' })
  metric_value: number;

  @Column({ type: 'text' })
  label: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
