// Script to create a sample user for testing
// Run with: node scripts/create-sample-user.js

require('dotenv').config({ path: './.env.local' });
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-budget';
const dbName = process.env.MONGODB_DB || 'travel-budget';

async function createSampleUser() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db(dbName);
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: 'demo@example.com' });
    
    if (existingUser) {
      console.log('Sample user already exists. Skipping creation.');
      return;
    }
    
    // Create hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create sample user
    const user = {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      settings: {
        imageDisplayMode: 'blurred-background',
        defaultCurrency: 'USD',
        language: 'English',
        notifications: true,
      },
      createdAt: new Date()
    };
    
    // Insert the user
    const result = await db.collection('users').insertOne(user);
    console.log('Sample user created with ID:', result.insertedId);
    
    // Create a sample holiday for this user
    const holiday = {
      userId: result.insertedId.toString(),
      title: 'Weekend in Paris',
      destination: 'Paris, France',
      startDate: new Date('2023-08-15'),
      endDate: new Date('2023-08-18'),
      budget: 1500,
      expenses: [
        {
          description: 'Flight tickets',
          amount: 350,
          category: 'transportation',
          date: new Date('2023-08-15')
        },
        {
          description: 'Hotel booking',
          amount: 450,
          category: 'accommodation',
          date: new Date('2023-08-15')
        },
        {
          description: 'Dinner at Le Bistro',
          amount: 120,
          category: 'food',
          date: new Date('2023-08-16')
        }
      ],
      notes: 'Anniversary trip',
      createdAt: new Date(),
      updatedAt: new Date(),
      imageType: 'preset',
      imagePreset: 3
    };
    
    // Insert the holiday
    const holidayResult = await db.collection('holidays').insertOne(holiday);
    console.log('Sample holiday created with ID:', holidayResult.insertedId);
    
    console.log('Sample data created successfully!');
    console.log('Login with:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating sample user:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

createSampleUser(); 