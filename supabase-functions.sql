-- Function to check if a tip exists for a user and date
CREATE OR REPLACE FUNCTION tip_exists(p_user_id UUID, p_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM tips 
    WHERE user_id = p_user_id AND date = p_date
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- Function to update a tip
CREATE OR REPLACE FUNCTION update_tip(p_user_id UUID, p_date DATE, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tips 
  SET amount = p_amount
  WHERE user_id = p_user_id AND date = p_date;
END;
$$;

-- Function to insert a tip
CREATE OR REPLACE FUNCTION insert_tip(p_user_id UUID, p_date DATE, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO tips (user_id, date, amount)
  VALUES (p_user_id, p_date, p_amount);
END;
$$;

-- Combined function to save a tip (insert or update)
CREATE OR REPLACE FUNCTION save_tip(p_user_id UUID, p_date DATE, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Check if tip exists
  SELECT EXISTS(
    SELECT 1 FROM tips 
    WHERE user_id = p_user_id AND date = p_date
  ) INTO v_exists;
  
  -- Update or insert
  IF v_exists THEN
    UPDATE tips 
    SET amount = p_amount
    WHERE user_id = p_user_id AND date = p_date;
  ELSE
    INSERT INTO tips (user_id, date, amount)
    VALUES (p_user_id, p_date, p_amount);
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$; 