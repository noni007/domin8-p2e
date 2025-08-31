-- Fix security issues from the previous migration

-- Update functions to have proper search_path
CREATE OR REPLACE FUNCTION encrypt_social_token(token_value TEXT, user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION decrypt_social_token(encrypted_token TEXT, user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
SET search_path = public
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

-- Replace the SECURITY DEFINER view with a regular view that uses RLS
-- Drop the previous view
DROP VIEW IF EXISTS user_social_integrations;

-- Create a function to get user's social integrations securely
CREATE OR REPLACE FUNCTION get_user_social_integrations(target_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  platform TEXT,
  platform_user_id TEXT,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  integration_data JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use the calling user's ID if no target specified
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;
  
  -- Only allow users to access their own integrations
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Access denied: Users can only access their own social integrations';
  END IF;
  
  RETURN QUERY
  SELECT 
    si.id,
    si.user_id,
    si.platform,
    si.platform_user_id,
    si.platform_username,
    decrypt_social_token(si.access_token, si.user_id) AS access_token,
    decrypt_social_token(si.refresh_token, si.user_id) AS refresh_token,
    si.expires_at,
    si.integration_data,
    si.is_active,
    si.created_at,
    si.updated_at
  FROM social_integrations si
  WHERE si.user_id = target_user_id;
END;
$$;