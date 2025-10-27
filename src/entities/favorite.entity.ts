import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Listing } from './listing.entity';

@Entity('favorites')
@Index(['userId'])
@Index(['listingId'])
@Index(['createdAt'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Listing, (listing) => listing.favorites)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @Column()
  listingId: number;
}
