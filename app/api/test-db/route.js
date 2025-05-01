import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';

export async function GET() {
  try {
    // Connect to the MongoDB cluster
    const client = await clientPromise;
    
    // Get a list of all databases
    const dbList = await client.db().admin().listDatabases();
    
    return NextResponse.json({ 
      message: 'Connected to MongoDB successfully!', 
      databases: dbList.databases.map(db => db.name)
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to connect to MongoDB', details: error.message },
      { status: 500 }
    );
  }
} 