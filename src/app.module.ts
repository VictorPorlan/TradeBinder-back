import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { User, Card, Edition, Listing, Transaction, Message, Review, Favorite, Location } from './entities';
import { AuthModule } from './modules/auth.module';
import { CardsModule } from './modules/cards.module';
import { ListingsModule } from './modules/listings.module';
import { EditionsModule } from './modules/editions.module';
import { TransactionsModule } from './modules/transactions.module';
import { MessagesModule } from './modules/messages.module';
import { LocationsModule } from './modules/locations.module';

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM configuration
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [User, Card, Edition, Listing, Transaction, Message, Review, Favorite, Location],
    }),
    // Auth module
    AuthModule,
    // Cards module
    CardsModule,
    // Listings module
    ListingsModule,
    // Editions module
    EditionsModule,
    // Transactions module
    TransactionsModule,
    // Messages module
    MessagesModule,
    // Locations module
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
