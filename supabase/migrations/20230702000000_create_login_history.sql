-- Create login history table if it doesn't exist
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  successful BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own login history" 
  ON login_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert login history" 
  ON login_history FOR INSERT 
  WITH CHECK (true);

-- Create function to record login history
CREATE OR REPLACE FUNCTION public.record_login_history()
RETURNS TRIGGER AS $$
DECLARE
  user_agent_text TEXT;
  ip_text TEXT;
BEGIN
  -- Extract user agent and IP from the session
  user_agent_text := new.user_agent;
  ip_text := new.ip::text;
  
  -- Insert into login history
  INSERT INTO public.login_history (
    user_id, 
    ip_address, 
    user_agent, 
    successful
  )
  VALUES (
    new.user_id, 
    ip_text, 
    user_agent_text, 
    true
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for login history
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.sessions;
CREATE TRIGGER on_auth_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE PROCEDURE public.record_login_history();

-- Create function to record failed login attempts
CREATE OR REPLACE FUNCTION public.record_failed_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if the error is related to authentication
  IF new.error_code IN ('invalid_credentials', 'invalid_grant') THEN
    INSERT INTO public.login_history (
      user_id,
      ip_address,
      user_agent,
      successful
    )
    VALUES (
      new.auth_user_id,
      new.ip::text,
      new.user_agent,
      false
    );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for failed login attempts
DROP TRIGGER IF EXISTS on_auth_user_login_failed ON auth.flow_state;
CREATE TRIGGER on_auth_user_login_failed
  AFTER INSERT ON auth.flow_state
  FOR EACH ROW
  WHEN (new.error_code IS NOT NULL)
  EXECUTE PROCEDURE public.record_failed_login();
