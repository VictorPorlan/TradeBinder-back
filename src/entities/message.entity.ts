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

@Entity('messages')
@Index(['createdAt'])
@Index(['senderId'])
@Index(['receiverId'])
@Index(['listingId'])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: number;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: number;

  @ManyToOne(() => Listing, (listing) => listing.messages)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @Column()
  listingId: number;
}
