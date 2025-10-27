import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from '../controllers/messages.controller';
import { MessagesService } from '../services/messages.service';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Listing } from '../entities/listing.entity';
import { Transaction } from '../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User, Listing, Transaction]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}

