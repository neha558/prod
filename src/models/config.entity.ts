import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'configs' })
export class Config extends BaseEntity {
  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
  })
  value: string;
}
