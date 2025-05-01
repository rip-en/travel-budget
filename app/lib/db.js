import clientPromise from '@/app/lib/mongodb';

// Database Name - fallback to 'travel-budget' if not specified in environment variables
const dbName = process.env.MONGODB_DB || 'travel-budget';

// Log for debugging
console.log('Using database:', dbName);

export async function getCollection(collectionName) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    return db.collection(collectionName);
  } catch (error) {
    console.error('Error connecting to MongoDB collection:', error);
    throw error;
  }
}

export async function findOne(collectionName, query = {}) {
  const collection = await getCollection(collectionName);
  return collection.findOne(query);
}

export async function find(collectionName, query = {}, options = {}) {
  const collection = await getCollection(collectionName);
  return collection.find(query, options).toArray();
}

export async function insertOne(collectionName, document) {
  const collection = await getCollection(collectionName);
  return collection.insertOne(document);
}

export async function updateOne(collectionName, filter, update) {
  const collection = await getCollection(collectionName);
  return collection.updateOne(filter, update);
}

export async function deleteOne(collectionName, filter) {
  const collection = await getCollection(collectionName);
  return collection.deleteOne(filter);
} 