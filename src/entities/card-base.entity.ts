import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Listing } from './listing.entity';

@Entity('cards')
@Index(['name'])
@Index(['manaCost'])
@Index(['type'])
@Index(['rarity'])
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  manaCost: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  subtype: string;

  @Column({ nullable: true })
  rarity: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'text', nullable: true })
  flavorText: string;

  @Column({ nullable: true })
  power: string;

  @Column({ nullable: true })
  toughness: string;

  @Column({ nullable: true })
  loyalty: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  artist: string;

  @Column({ nullable: true })
  number: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Listing, (listing) => listing.card)
  listings: Listing[];
}
