-- Add BYOK columns to users table
ALTER TABLE users 
ADD COLUMN ai_provider VARCHAR(50) DEFAULT 'default',
ADD COLUMN encrypted_api_key VARCHAR(500) NULL;
