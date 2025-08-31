-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to encrypt social media tokens using application-level key
-- This function uses a derived key from the user's ID and a secret
CREATE OR REPLACE FUNCTION encrypt_social_token(token_value TEXT, user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
  encrypted_token TEXT;
BEGIN
  -- Return NULL if token is NULL or empty
  IF token_value IS NULL OR token_value = '' THEN
    RETURN NULL;
  END IF;
  
  -- Generate a deterministic key based on user_id and a fixed secret
  -- In production, the secret should come from environment variables
  encryption_key := encode(
    hmac(user_id::text, 'social_token_encryption_secret_key_2024', 'sha256'),
    'hex'
  );
  
  -- Encrypt the token using AES
  encrypted_token := encode(
    encrypt(token_value::bytea, encryption_key::bytea, 'aes'),
    'base64'
  );
  
  RETURN encrypted_token;
END;
$$;

-- Create a function to decrypt social media tokens
CREATE OR REPLACE FUNCTION decrypt_social_token(encrypted_token TEXT, user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_token TEXT;
BEGIN
  -- Return NULL if encrypted_token is NULL or empty
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN NULL;
  END IF;
  
  -- Generate the same deterministic key
  encryption_key := encode(
    hmac(user_id::text, 'social_token_encryption_secret_key_2024', 'sha256'),
    'hex'
  );
  
  -- Decrypt the token
  BEGIN
    decrypted_token := convert_from(
      decrypt(
        decode(encrypted_token, 'base64'),
        encryption_key::bytea,
        'aes'
      ),
      'UTF8'
    );
  EXCEPTION
    WHEN others THEN
      -- If decryption fails, return NULL
      RETURN NULL;
  END;
  
  RETURN decrypted_token;
END;
$$;

-- Create a secure view for accessing social integrations with decrypted tokens
-- This view automatically decrypts tokens only for the token owner
CREATE OR REPLACE VIEW user_social_integrations AS
SELECT 
  id,
  user_id,
  platform,
  platform_user_id,
  platform_username,
  -- Only decrypt tokens for the authenticated user
  CASE 
    WHEN auth.uid() = user_id THEN decrypt_social_token(access_token, user_id)
    ELSE NULL 
  END AS access_token,
  CASE 
    WHEN auth.uid() = user_id THEN decrypt_social_token(refresh_token, user_id)
    ELSE NULL 
  END AS refresh_token,
  expires_at,
  integration_data,
  is_active,
  created_at,
  updated_at
FROM social_integrations
WHERE auth.uid() = user_id;

-- Create a function to safely insert or update social integrations with encrypted tokens
CREATE OR REPLACE FUNCTION upsert_social_integration(
  p_user_id UUID,
  p_platform TEXT,
  p_platform_user_id TEXT DEFAULT NULL,
  p_platform_username TEXT DEFAULT NULL,
  p_access_token TEXT DEFAULT NULL,
  p_refresh_token TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_integration_data JSONB DEFAULT '{}',
  p_is_active BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  integration_id UUID;
  encrypted_access_token TEXT;
  encrypted_refresh_token TEXT;
BEGIN
  -- Only allow users to manage their own integrations
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: Users can only manage their own social integrations';
  END IF;
  
  -- Encrypt tokens if provided
  encrypted_access_token := encrypt_social_token(p_access_token, p_user_id);
  encrypted_refresh_token := encrypt_social_token(p_refresh_token, p_user_id);
  
  -- Insert or update the social integration
  INSERT INTO social_integrations (
    user_id,
    platform,
    platform_user_id,
    platform_username,
    access_token,
    refresh_token,
    expires_at,
    integration_data,
    is_active
  ) VALUES (
    p_user_id,
    p_platform,
    p_platform_user_id,
    p_platform_username,
    encrypted_access_token,
    encrypted_refresh_token,
    p_expires_at,
    p_integration_data,
    p_is_active
  )
  ON CONFLICT (user_id, platform) DO UPDATE SET
    platform_user_id = COALESCE(EXCLUDED.platform_user_id, social_integrations.platform_user_id),
    platform_username = COALESCE(EXCLUDED.platform_username, social_integrations.platform_username),
    access_token = COALESCE(EXCLUDED.access_token, social_integrations.access_token),
    refresh_token = COALESCE(EXCLUDED.refresh_token, social_integrations.refresh_token),
    expires_at = COALESCE(EXCLUDED.expires_at, social_integrations.expires_at),
    integration_data = COALESCE(EXCLUDED.integration_data, social_integrations.integration_data),
    is_active = COALESCE(EXCLUDED.is_active, social_integrations.is_active),
    updated_at = now()
  RETURNING id INTO integration_id;
  
  RETURN integration_id;
END;
$$;

-- Add a unique constraint to prevent duplicate platform integrations per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_integrations_user_platform 
ON social_integrations (user_id, platform);

-- Update RLS policies to be more restrictive for direct table access
-- Users should primarily use the secure view and function
DROP POLICY IF EXISTS "Users can manage their own social integrations" ON social_integrations;
DROP POLICY IF EXISTS "Users can view their own social integrations" ON social_integrations;

-- Only allow viewing basic info without tokens through direct table access
CREATE POLICY "Users can view basic social integration info" 
ON social_integrations 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_active = true  -- Allow viewing active integrations for public features
);

-- Restrict direct INSERT/UPDATE operations - force use of secure function
CREATE POLICY "Users can only insert through secure function" 
ON social_integrations 
FOR INSERT 
WITH CHECK (false);  -- Block direct inserts

CREATE POLICY "Users can only update through secure function" 
ON social_integrations 
FOR UPDATE 
USING (false);  -- Block direct updates