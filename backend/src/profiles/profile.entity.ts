import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryColumn({ type: 'uuid', name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenant_id: string;

  @Column({ type: 'text', name: 'full_name', default: '' })
  full_name: string;

  @Column({ type: 'text', name: 'email' })
  email: string;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  avatar_url: string | null;

  @Column({ name: 'role', default: 'viewer' })
  role: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;
}
