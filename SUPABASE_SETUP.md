# Supabase Setup Guide for Tip Tracker

This guide will help you set up your Supabase project for the Tip Tracker application.

## Step 1: Run the Database Schema

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project: "Tip Tracker"
3. Navigate to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy and paste the contents of `supabase-schema.sql` into the editor
6. Click "Run" to execute the SQL script

## Step 2: Enable Email Authentication

1. In your Supabase dashboard, go to "Authentication" in the left sidebar
2. Click on "Providers"
3. Make sure "Email" is enabled
4. Configure the following settings:
   - Enable "Confirm email"
   - Set "Secure email change" to your preference
   - Set a custom email template if desired

## Step 3: Create a Test User

1. Go to "Authentication" > "Users" in the Supabase dashboard
2. Click "Add User"
3. Enter your email and password
4. Click "Create User"

## Step 4: Update Environment Variables

Make sure your `.env.local` file has the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://sobpwraeujxrdrddvqcz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYnB3cmFldWp4cmRyZGR2cWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Njg4NTIsImV4cCI6MjA1NzE0NDg1Mn0.VVYD8gohu4C7NGFJUIsMXsD_HoO_MSVR0ReZFCC8DqI
DATABASE_URL=postgres://postgres.sobpwraeujxrdrddvqcz:Austinwrap1!1990!!@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

## Step 5: Test the Connection

1. Start your Next.js development server: `npm run dev`
2. Navigate to http://localhost:3000/test
3. Click "Test Connection" to verify that both Supabase and Postgres connections are working

## Step 6: Sign Up in Your Application

1. Navigate to http://localhost:3000/signup
2. Create a new account with your email and password
3. Verify your email if required
4. Log in to your application

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that your environment variables are correct
3. Make sure the SQL script executed successfully
4. Check that authentication is properly enabled in Supabase

## Database Tables

The schema creates the following tables:

1. **tips** - Stores user tip entries
   - id: UUID (primary key)
   - user_id: UUID (foreign key to auth.users)
   - date: DATE
   - amount: DECIMAL
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

2. **user_profiles** - Stores additional user information
   - id: UUID (primary key, references auth.users)
   - email: TEXT
   - full_name: TEXT
   - premium_status: BOOLEAN
   - premium_until: TIMESTAMP
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

Row Level Security (RLS) policies are set up to ensure users can only access their own data. 