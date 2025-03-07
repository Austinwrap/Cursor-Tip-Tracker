# Bartender Tip Tracker

A web application for bartenders to track their daily tips, with a free tier offering basic functionality and a paid tier offering advanced features like historical data, averages, and visualizations.

## Features

### Free Tier
- Authentication with email/password
- Daily tip tracking
- Tip history view
- Unlimited tip entries

### Paid Tier
- All free tier features
- Monthly and yearly summaries
- Day of week analysis
- Best and worst days tracking
- Visual charts and graphs
- Future earnings projections

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with Supabase integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bartender-tip-tracker.git
   cd bartender-tip-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a Supabase project:
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Set up the database tables (see Database Setup below)
   - Get your Supabase URL and anon key

4. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

Create the following tables in your Supabase project:

#### Users Table

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

#### Tips Table

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

### Supabase Auth Setup

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable Email/Password sign-in method
3. Configure any additional settings as needed (password strength, etc.)

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add your environment variables (Supabase URL and anon key)
4. Deploy!

## Future Development

This application is designed to be eventually adapted into a mobile app. The codebase is structured with modularity and scalability in mind to facilitate this transition.

## License

This project is licensed under the ISC License. 