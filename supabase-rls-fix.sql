-- Create a function to create a user record that bypasses RLS
CREATE OR REPLACE FUNCTION create_user_record(
  p_user_id UUID,
  p_email TEXT,
  p_is_paid BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the function creator
AS $$
BEGIN
  INSERT INTO public.users (id, email, is_paid)
  VALUES (p_user_id, p_email, p_is_paid)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Create a function to create a tip that bypasses RLS
CREATE OR REPLACE FUNCTION create_tip(
  p_user_id UUID,
  p_date DATE,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the function creator
AS $$
BEGIN
  -- First ensure the user exists
  INSERT INTO public.users (id, email, is_paid)
  VALUES (p_user_id, 'auto-created@example.com', FALSE)
  ON CONFLICT (id) DO NOTHING;
  
  -- Then insert or update the tip
  INSERT INTO public.tips (user_id, date, amount)
  VALUES (p_user_id, p_date, p_amount)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET amount = p_amount;
END;
$$;

-- Update the RLS policies to allow the current user to insert their own record
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the RLS policies to allow the current user to insert their own tips
DROP POLICY IF EXISTS "Users can insert their own tips" ON tips;
CREATE POLICY "Users can insert their own tips" ON tips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a unique constraint on user_id and date for tips
ALTER TABLE tips DROP CONSTRAINT IF EXISTS tips_user_id_date_key;
ALTER TABLE tips ADD CONSTRAINT tips_user_id_date_key UNIQUE (user_id, date); 