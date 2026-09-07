-- Add optional profile fields without changing existing users.
SET @add_phone = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL',
    'SELECT 1'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'phone'
);
PREPARE add_phone_statement FROM @add_phone;
EXECUTE add_phone_statement;
DEALLOCATE PREPARE add_phone_statement;

SET @add_address = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN address TEXT NULL',
    'SELECT 1'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'address'
);
PREPARE add_address_statement FROM @add_address;
EXECUTE add_address_statement;
DEALLOCATE PREPARE add_address_statement;