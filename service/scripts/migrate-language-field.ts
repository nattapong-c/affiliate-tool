#!/usr/bin/env bun

/**
 * Migration Script: Fix Language Field
 * 
 * This script drops all indexes and recreates them without text index
 * to support Thai language keywords.
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/facebook-automation';

async function migrate() {
  console.log('🔄 Starting migration...');
  console.log(`📦 Connecting to MongoDB: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection('keywordhistories');

    // Drop ALL existing indexes
    console.log('🗑️  Dropping all existing indexes...');
    await collection.dropIndexes();
    console.log('✅ Dropped all indexes');

    // Create new indexes (no text index)
    console.log('📝 Creating new indexes...');
    await collection.createIndex({ productTitle: 1 });
    console.log('✅ Created productTitle index');
    
    await collection.createIndex({ createdAt: -1 });
    console.log('✅ Created createdAt index');
    
    await collection.createIndex({ language: 1 });
    console.log('✅ Created language index');
    
    await collection.createIndex({ language: 1, createdAt: -1 });
    console.log('✅ Created language+createdAt compound index');

    // Update existing documents with invalid language values
    console.log('🔄 Updating existing documents...');
    const result = await collection.updateMany(
      { language: { $nin: ['en', 'th'] } },
      { $set: { language: 'en' } }
    );
    console.log(`✅ Updated ${result.modifiedCount} documents`);

    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

migrate();
