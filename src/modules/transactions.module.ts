import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from '../controllers/transactions.controller';
import { TransactionsService } from '../services/transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { Listing } from '../entities/listing.entity';
import { User } from '../entities/user.entity';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Listing, User, Message]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
