import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Listing } from './listing.entity';
import { Message } from './message.entity';
import { Review } from './review.entity';
import { Favorite } from './favorite.entity';
import { Transaction } from './transaction.entity';
import { Location } from './location.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['locationId'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  locationId: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Location, (location) => location.users)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @OneToMany(() => Listing, (listing) => listing.user)
  listings: Listing[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviewsGiven: Review[];

  @OneToMany(() => Review, (review) => review.reviewed)
  reviewsReceived: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Transaction, (transaction) => transaction.buyer)
  purchases: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.seller)
  sales: Transaction[];
}
