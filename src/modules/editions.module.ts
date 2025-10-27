import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edition } from '../entities/edition.entity';
import { EditionsController } from '../controllers/editions.controller';
import { EditionsService } from '../services/editions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edition])],
  controllers: [EditionsController],
  providers: [EditionsService],
  exports: [EditionsService],
})
export class EditionsModule {}
