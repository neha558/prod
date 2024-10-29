import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Stackers } from './stackers.entity';

@Entity({ name: 'stackers_token_ids' })
export class StackersTokenId extends BaseEntity {
  @Column({
    type: 'int',
    name: 'token_id',
    nullable: false,
  })
  token_id: number;

  @Column({
    type: 'text',
    name: 'token_staking_time',
    nullable: true,
  })
  token_staking_time: string;

  @ManyToOne(() => Stackers, (nft) => nft.stackers_token_ids)
  stacker: Stackers;
}
