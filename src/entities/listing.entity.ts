import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Card } from './card-base.entity';
import { Edition } from './edition.entity';
import { Location } from './location.entity';
import { Transaction } from './transaction.entity';
import { Message } from './message.entity';
import { Favorite } from './favorite.entity';

@Entity('listings')
@Index(['userId'])
@Index(['cardId'])
@Index(['editionId'])
@Index(['locationId'])
@Index(['condition'])
@Index(['isActive'])
@Index(['createdAt'])
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  cardId: number;

  @Column()
  editionId: number;

  @Column()
  locationId: number;

  @Column({
    type: 'enum',
    enum: ['mint', 'near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged'],
    default: 'near_mint',
  })
  condition: string;

  @Column({ default: false })
  isFoil: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.listings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Card, (card) => card.listings)
  @JoinColumn({ name: 'cardId' })
  card: Card;

  @ManyToOne(() => Edition, (edition) => edition.listings)
  @JoinColumn({ name: 'editionId' })
  edition: Edition;

  @ManyToOne(() => Location, (location) => location.listings)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @OneToMany(() => Transaction, (transaction) => transaction.listing)
  transactions: Transaction[];

  @OneToMany(() => Message, (message) => message.listing)
  messages: Message[];

  @OneToMany(() => Favorite, (favorite) => favorite.listing)
  favorites: Favorite[];
}