import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Listing } from './listing.entity';

@Entity('transactions')
@Index(['listingId'])
@Index(['buyerId'])
@Index(['sellerId'])
@Index(['status'])
@Index(['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  listingId: number;

  @Column()
  buyerId: number;

  @Column()
  sellerId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerUnit: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ type: 'text', nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Listing, (listing) => listing.transactions)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => User, (user) => user.purchases)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @ManyToOne(() => User, (user) => user.sales)
  @JoinColumn({ name: 'sellerId' })
  seller: User;
}
