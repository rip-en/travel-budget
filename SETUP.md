# Travel Budget - Setup Guide

This guide will help you set up the Travel Budget application with the user account system.

## Setting Up Environment Variables

1. Create a `.env.local` file in the root directory with the following content:

```
# MongoDB Connection
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/travel-budget

# Database Name
MONGODB_DB=travel-budget

# Secret key for JWT token generation
# For production, use a long, random string
JWT_SECRET=your_secure_jwt_secret_key_replace_this_in_production
```

## MongoDB Setup

You have two options for setting up MongoDB:

### Option 1: Local MongoDB

1. Install MongoDB on your local machine: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use the connection string: `mongodb://localhost:27017/travel-budget`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster
3. Set up a database user (with read/write permissions)
4. Get your connection string and add it to `.env.local`
5. Replace `<username>`, `<password>`, and `<dbname>` with your actual values

Example Atlas connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

## Creating a Sample User

We've included a script to create a sample user in the database:

1. Make sure your MongoDB is running and connected
2. Run the script:
   ```
   npm run create-sample-user
   ```
3. This will create a user with:
   - Email: demo@example.com
   - Password: password123

## Running the Application

After setting up the environment and database:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser at http://localhost:3000

## Troubleshooting

### Connection Issues

If you're having trouble connecting to MongoDB:

1. Check if your MongoDB service is running
2. Verify the connection string in `.env.local`
3. Make sure your IP is whitelisted if using MongoDB Atlas
4. Check if your database user has the correct permissions

### Authentication Issues

If users can't sign up or log in:

1. Make sure the JWT_SECRET is set in `.env.local`
2. Check the browser console for any errors
3. Verify that the API routes are working (check network tab)

### Route Protection

The application includes middleware that protects all routes except:
- `/login`
- `/signup`
- `/` (redirects to login)
- `/api/auth/*` endpoints

Users must be authenticated to access other routes. 