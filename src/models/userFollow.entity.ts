import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'user_follow' })
export class UserFollow extends BaseEntity {
  @ManyToOne(() => User, (user) => user.favNFTs)
  user: User;

  @ManyToOne(() => User, (user) => user.favNFTs)
  follows: User;
}
