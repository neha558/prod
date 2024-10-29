import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StackersTokenId } from './stackersTokenIds.entity';

@Entity({ name: 'stackers' })
export class Stackers extends BaseEntity {
  @Column({
    type: 'text',
    name: 'account_address',
    unique: true,
  })
  accountAddress: string;

  @Column({
    type: 'float',
    name: 'balance',
    nullable: true,
    default: 0,
  })
  balance: number;

  @Column({
    type: 'float',
    name: 'rewards_released',
    nullable: true,
    default: 0,
  })
  rewardsReleased: number;

  @Column({
    type: 'text',
    name: 'last_sync_on',
    nullable: true,
  })
  lastSyncOn: string;

  @OneToMany(
    () => StackersTokenId,
    (stackersTokenId) => stackersTokenId.stacker,
  )
  stackers_token_ids: StackersTokenId[];
}
