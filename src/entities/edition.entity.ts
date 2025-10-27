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

@Entity('editions')
@Index(['name'])
@Index(['releaseDate'])
export class Edition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ default: false })
  hasFoil: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Listing, (listing) => listing.edition)
  listings: Listing[];
}
