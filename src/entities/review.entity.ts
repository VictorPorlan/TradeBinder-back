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

@Entity('reviews')
@Index(['createdAt'])
@Index(['reviewerId'])
@Index(['reviewedId'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.reviewsGiven)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: number;

  @ManyToOne(() => User, (user) => user.reviewsReceived)
  @JoinColumn({ name: 'reviewedId' })
  reviewed: User;

  @Column()
  reviewedId: number;
}
