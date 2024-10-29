import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'email_subscription' })
export class EmailSubscription extends BaseEntity {
  @Column({
    type: 'text',
    name: 'email',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    name: 'origin',
    nullable: true,
  })
  origin: string;
}
