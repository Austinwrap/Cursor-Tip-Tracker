# Supabase Database Schema for Premium Features

This guide explains how to set up your Supabase database schema to support premium features in your Tip Tracker application.

## Required Tables

### 1. Users Table

The `users` table needs to be updated with additional columns to track premium status:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS premium_features_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT '',
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_id VARCHAR(255);
```

### 2. Purchases Table

Create a new `purchases` table to track all purchase transactions:

```sql
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  subscription_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_processor VARCHAR(50) NOT NULL,
  payment_id VARCHAR(255),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);
```

### 3. Subscription Events Table

Create a table to track subscription lifecycle events:

```sql
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  subscription_id VARCHAR(255),
  plan_type VARCHAR(50),
  subscription_type VARCHAR(50),
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS subscription_events_user_id_idx ON subscription_events(user_id);
```

## Row Level Security (RLS) Policies

Set up RLS policies to secure your data:

### Purchases Table

```sql
-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own purchases
CREATE POLICY purchases_select_policy ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for service role to manage all purchases
CREATE POLICY purchases_service_policy ON purchases
  FOR ALL TO service_role USING (true);
```

### Subscription Events Table

```sql
-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own subscription events
CREATE POLICY subscription_events_select_policy ON subscription_events
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for service role to manage all subscription events
CREATE POLICY subscription_events_service_policy ON subscription_events
  FOR ALL TO service_role USING (true);
```

## Database Functions

Create a function to update a user's premium status:

```sql
CREATE OR REPLACE FUNCTION update_user_premium_status(
  user_id UUID,
  is_premium BOOLEAN,
  plan VARCHAR,
  status VARCHAR
) RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    is_paid = is_premium,
    plan_type = plan,
    subscription_status = status,
    premium_features_enabled = is_premium,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Triggers

Create a trigger to log subscription events:

```sql
CREATE OR REPLACE FUNCTION log_subscription_event() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.subscription_status IS DISTINCT FROM NEW.subscription_status THEN
    INSERT INTO subscription_events (
      user_id,
      event_type,
      plan_type,
      subscription_type,
      metadata
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.subscription_status = 'active' THEN 'subscription_activated'
        WHEN NEW.subscription_status = 'canceled' THEN 'subscription_canceled'
        WHEN NEW.subscription_status = 'lifetime' THEN 'lifetime_activated'
        ELSE 'subscription_updated'
      END,
      NEW.plan_type,
      NEW.subscription_type,
      jsonb_build_object('old_status', OLD.subscription_status, 'new_status', NEW.subscription_status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_status_change
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.subscription_status IS DISTINCT FROM NEW.subscription_status)
  EXECUTE FUNCTION log_subscription_event();
```

## How to Apply These Changes

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the SQL statements above
5. Run the query to apply the changes

## Testing the Schema

After applying these changes, you can test the schema by:

1. Manually inserting a test purchase record
2. Updating a user's premium status
3. Verifying that the subscription event is logged

Example test:

```sql
-- Update a user's premium status
SELECT update_user_premium_status(
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  true,
  'starter',
  'active'
);

-- Verify the user's status was updated
SELECT id, is_paid, plan_type, subscription_status, premium_features_enabled
FROM users
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Verify a subscription event was logged
SELECT * FROM subscription_events
WHERE user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY created_at DESC
LIMIT 1;
``` 