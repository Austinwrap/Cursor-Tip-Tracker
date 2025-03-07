# Setting Up Cursor Tip Tracker

This guide will help you set up the Cursor Tip Tracker application correctly, including the Supabase database configuration.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Supabase account (free tier is sufficient)

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Create a new project
3. Once your project is created, go to the SQL Editor
4. Copy and paste the contents of the `supabase-setup.sql` file into the SQL Editor
5. Click "Run" to execute the SQL commands
6. This will create the necessary tables, indexes, and security policies

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to Authentication → Settings
2. Under "Email Auth", make sure "Enable Email Signup" is turned ON
3. You can choose whether to require email confirmation (recommended for production)
4. Save your changes

## Step 3: Get Your API Keys

1. In your Supabase dashboard, go to Project Settings → API
2. Copy your "Project URL" and "anon/public" key
3. You'll need these for the next step

## Step 4: Configure Environment Variables

1. In your project directory, make sure you have a `.env.local` file
2. Add the following lines to the file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Replace `your-project-url` and `your-anon-key` with the values from Step 3

## Step 5: Run the Application

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Troubleshooting

### Sign-up Issues

- If sign-up doesn't work, check your Supabase authentication settings
- Make sure the SQL setup script ran successfully
- Check the browser console for any errors

### Sign-in Issues

- If sign-in doesn't work, try signing up with a new account
- Make sure the user exists in the `auth.users` table in Supabase
- Check if the user also exists in your `public.users` table

### Database Issues

- If you see database errors, make sure your SQL setup script ran successfully
- Check that Row Level Security (RLS) policies are correctly set up
- Verify that your environment variables are correct

## Need More Help?

If you're still having issues, you can:

1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Look for errors in your browser's developer console
3. Verify your database tables and policies in the Supabase dashboard 