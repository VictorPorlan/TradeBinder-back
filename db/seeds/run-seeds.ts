#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, Card, Edition, Listing, Location } from '../../src/entities';
import * as bcrypt from 'bcryptjs';
import { seedEditions } from '../../src/db/seeds/seed-editions';
import { seedLocations } from '../../src/db/seeds/seed-locations';

async function runSeeds() {
  const logger = new Logger('SeedRunner');
  
  try {
    logger.log('🌱 Starting database seeding...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    
    // Get repositories from DataSource
    const userRepository = dataSource.getRepository(User);
    const cardRepository = dataSource.getRepository(Card);
    const editionRepository = dataSource.getRepository(Edition);
    const listingRepository = dataSource.getRepository(Listing);
    const locationRepository = dataSource.getRepository(Location);
    
    logger.log('📋 Checking existing data...');
    
    // Seed locations first
    await seedLocations(dataSource);
    
    // Get Mallorca location for users
    const mallorcaLocation = await locationRepository.findOne({
      where: { name: 'Mallorca' },
    });
    
    if (!mallorcaLocation) {
      throw new Error('Mallorca location not found. Please run location seeds first.');
    }
    
    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      logger.log(`👥 Found ${existingUsers} existing users, skipping user creation`);
    } else {
      // Create test users
      const hashedPassword = await bcrypt.hash('', 10);
      
      const users = [
        {
          email: 'admin@tradebinder.com',
          username: 'admin',
          password: hashedPassword,
          locationId: mallorcaLocation.id,
          isActive: true,
        },
        {
          email: 'john@example.com',
          username: 'john_doe',
          password: hashedPassword,
          locationId: mallorcaLocation.id,
          isActive: true,
        },
        {
          email: 'jane@example.com',
          username: 'jane_smith',
          password: hashedPassword,
          locationId: mallorcaLocation.id,
          isActive: true,
        },
      ];
      
      const createdUsers = await userRepository.save(users);
      logger.log(`👥 Created ${createdUsers.length} users`);
    }
    
    // Check if cards already exist
    const existingCards = await cardRepository.count();
    if (existingCards > 0) {
      logger.log(`🃏 Found ${existingCards} existing cards, skipping card creation`);
    } else {
      // Create test cards with detailed information
      const cards = [
        {
          name: 'Lightning Bolt',
          manaCost: '{R}',
          type: 'Instant',
          rarity: 'Common',
          text: 'Lightning Bolt deals 3 damage to any target.',
          imageUrl: 'https://cards.scryfall.io/large/front/d/5/d573ef03-4730-45aa-93dd-e45ac1dbaf4a.jpg?1559591645',
          artist: 'Christopher Rush',
          number: '161',
          isActive: true,
        },
        {
          name: 'Black Lotus',
          manaCost: '{0}',
          type: 'Artifact',
          rarity: 'Rare',
          text: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
          imageUrl: 'https://cards.scryfall.io/large/front/b/0/b0faa7f2-b547-42c4-a810-839da50dadfe.jpg?1559591477',
          artist: 'Christopher Rush',
          number: '232',
          isActive: true,
        },
        {
          name: 'Counterspell',
          manaCost: '{U}{U}',
          type: 'Instant',
          rarity: 'Common',
          text: 'Counter target spell.',
          imageUrl: 'https://cards.scryfall.io/large/front/0/d/0df55e3f-14de-46ef-b6b1-616618724d9e.jpg?1559591713',
          artist: 'Mark Poole',
          number: '61',
          isActive: true,
        },
        {
          name: 'Serra Angel',
          manaCost: '{3}{W}{W}',
          type: 'Creature — Angel',
          subtype: 'Angel',
          rarity: 'Uncommon',
          text: 'Flying, vigilance',
          power: '4',
          toughness: '4',
          imageUrl: 'https://cards.scryfall.io/large/front/f/8/f8ac5006-91bd-4803-93da-f87cf196dd2f.jpg?1559591394',
          artist: 'Douglas Shuler',
          number: '25',
          isActive: true,
        },
        {
          name: 'Shivan Dragon',
          manaCost: '{4}{R}{R}',
          type: 'Creature — Dragon',
          subtype: 'Dragon',
          rarity: 'Rare',
          text: 'Flying\n{R}: Shivan Dragon gets +1/+0 until end of turn.',
          power: '5',
          toughness: '5',
          imageUrl: 'https://cards.scryfall.io/large/front/f/e/fefbf149-f988-4f8b-9f53-56f5878116a6.jpg?1559591401',
          artist: 'Melissa A. Benson',
          number: '143',
          isActive: true,
        },
      ];
      
      const createdCards = await cardRepository.save(cards);
      logger.log(`🃏 Created ${createdCards.length} cards`);
    }
    
    // Seed editions using the dedicated function
    await seedEditions(dataSource);
    
    // Check if listings already exist
    const existingListings = await listingRepository.count();
    if (existingListings > 0) {
      logger.log(`📢 Found ${existingListings} existing listings, skipping listing creation`);
    } else {
      // Get existing data for relationships
      const users = await userRepository.find();
      const cards = await cardRepository.find();
      const editions = await editionRepository.find();
      
      // Create test listings (user-specific info)
      const listings = [
        {
          userId: users[0].id,
          cardId: cards[0].id,
          editionId: editions[0].id, // Black Lotus - Alpha
          locationId: mallorcaLocation.id,
          condition: 'near_mint',
          isFoil: false,
          price: 2500.00,
          quantity: 1,
          description: 'Black Lotus Alpha en perfecto estado. Disponible para entrega en Mallorca.',
          images: ['https://example.com/user-black-lotus-1.jpg', 'https://example.com/user-black-lotus-2.jpg'],
          isActive: true,
        },
        {
          userId: users[1].id,
          cardId: cards[1].id,
          editionId: editions[1].id, // Lightning Bolt - Beta
          locationId: mallorcaLocation.id,
          condition: 'lightly_played',
          isFoil: false,
          price: 150.00,
          quantity: 1,
          description: 'Lightning Bolt Beta con ligero desgaste en los bordes. Precio negociable.',
          images: ['https://example.com/user-lightning-bolt-1.jpg'],
          isActive: true,
        },
        {
          userId: users[2].id,
          cardId: cards[2].id,
          editionId: editions[2].id, // Counterspell - Unlimited
          locationId: mallorcaLocation.id,
          condition: 'near_mint',
          isFoil: false,
          price: 75.00,
          quantity: 1,
          description: 'Counterspell Unlimited en excelente estado. Envío disponible.',
          images: ['https://example.com/user-counterspell-1.jpg'],
          isActive: true,
        },
      ];
      
      const createdListings = await listingRepository.save(listings);
      logger.log(`📢 Created ${createdListings.length} listings`);
    }
    
    // Get final counts
    const finalUserCount = await userRepository.count();
    const finalCardCount = await cardRepository.count();
    const finalEditionCount = await editionRepository.count();
    const finalListingCount = await listingRepository.count();
    const finalLocationCount = await locationRepository.count();
    
    logger.log('✅ Database seeding completed successfully');
    logger.log('📊 Summary:');
    logger.log(`   - Locations: ${finalLocationCount}`);
    logger.log(`   - Users: ${finalUserCount}`);
    logger.log(`   - Cards: ${finalCardCount}`);
    logger.log(`   - Editions: ${finalEditionCount}`);
    logger.log(`   - Listings: ${finalListingCount}`);
    
    await app.close();
  } catch (error) {
    logger.error('❌ Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();