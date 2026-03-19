-- 1. Create the ENUM type for roles
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Employee');

-- 2. Create Users Table using the ENUM
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'Employee', -- Using the ENUM here
    manager_id CHAR(36) REFERENCES users(id) ON DELETE SET NULL, 
    annual_leave_balance INTEGER DEFAULT 21,
    sick_leave_balance INTEGER DEFAULT 14,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)