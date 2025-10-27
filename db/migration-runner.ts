#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import dataSource from '../typeorm.config'; // Import the DataSource instance

async function runMigrations() {
  const logger = new Logger('MigrationRunner');
  
  try {
    logger.log('🔄 Running database migrations...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const connection = dataSource; // Use the imported DataSource instance
    
    // Initialize the connection
    await connection.initialize();
    
    await connection.runMigrations();
    logger.log('✅ Migrations completed successfully');
    
    await connection.destroy();
    await app.close();
  } catch (error) {
    logger.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

async function revertMigrations() {
  const logger = new Logger('MigrationRunner');
  
  try {
    logger.log('🔄 Reverting database migrations...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const connection = dataSource;
    
    // Initialize the connection
    await connection.initialize();
    
    await connection.undoLastMigration();
    logger.log('✅ Last migration reverted successfully');
    
    await connection.destroy();
    await app.close();
  } catch (error) {
    logger.error('❌ Error reverting migrations:', error);
    process.exit(1);
  }
}

async function generateMigration(name: string) {
  const logger = new Logger('MigrationRunner');
  
  try {
    logger.log(`🔄 Generating migration: ${name}`);
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const connection = dataSource;
    
    // Initialize the connection
    await connection.initialize();
    
    // Generate migration using TypeORM CLI
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const command = `npx typeorm-ts-node-commonjs migration:generate -d typeorm.config.ts db/migrations/${name}`;
    await execAsync(command);
    
    logger.log(`✅ Migration ${name} generated successfully in db/migrations/`);
    
    await connection.destroy();
    await app.close();
  } catch (error) {
    logger.error('❌ Error generating migration:', error);
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];
const argument = process.argv[3];

switch (command) {
  case 'run':
    runMigrations();
    break;
  case 'revert':
    revertMigrations();
    break;
  case 'generate':
    if (!argument) {
      console.error('❌ Migration name is required');
      process.exit(1);
    }
    generateMigration(argument);
    break;
  default:
    console.log('Usage:');
    console.log('  npm run migration:run     - Run pending migrations');
    console.log('  npm run migration:revert   - Revert last migration');
    console.log('  npm run migration:generate - Generate new migration');
    break;
}
