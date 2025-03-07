# Cursor Tip Tracker

A modern web application for bartenders, servers, and service industry professionals to track their daily tips, analyze earnings patterns, and plan their finances.

![Cursor Tip Tracker](https://i.imgur.com/XYZ123.png)

## 🌟 Features

### Free Tier
- **Secure Authentication**: Sign up and log in with email/password
- **Daily Tip Tracking**: Record your tips for each shift
- **Tip History**: View your past earnings
- **Unlimited Entries**: No limits on how many shifts you can track

### Premium Tier
- **Advanced Analytics**: Monthly and yearly summaries
- **Pattern Recognition**: Day of week analysis to identify your best shifts
- **Performance Tracking**: Identify your best and worst days
- **Visual Insights**: Beautiful charts and graphs of your earnings
- **Financial Planning**: Future earnings projections based on your history

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/Austinwrap/Cursor-Tip-Tracker.git
   cd Cursor-Tip-Tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your Supabase project:
   - Create a project at [supabase.com](https://supabase.com)
   - Set up the database tables (see Database Setup below)
   - Copy your Supabase URL and anon key

4. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💾 Database Setup

Create the following tables in your Supabase project:

### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE
);

-- Set up Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Tips Table
```sql
CREATE TABLE tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  date DATE NOT NULL,
  amount INTEGER NOT NULL, -- Stored in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tips" ON tips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tips" ON tips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tips" ON tips
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX tips_user_id_idx ON tips(user_id);
CREATE INDEX tips_date_idx ON tips(date);
```

## 🛠️ Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with Supabase integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Vercel

## 📱 Future Development

This application is designed to be eventually adapted into a mobile app. The codebase is structured with modularity and scalability in mind to facilitate this transition.

## 📄 License

This project is licensed under the MIT License. 