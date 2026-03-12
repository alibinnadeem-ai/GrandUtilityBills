-- Grand City Building Management System - Neon PostgreSQL Schema
-- Run this SQL in your Neon database console to create all tables

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. OWNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS owners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50),
    email VARCHAR(255),
    buildings TEXT[], -- Array of building numbers
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on owner name for faster searches
CREATE INDEX IF NOT EXISTS idx_owners_name ON owners(name);

-- ============================================
-- 2. BILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    building_number VARCHAR(50) NOT NULL,
    building_name VARCHAR(255),
    floor VARCHAR(50),
    unit_number VARCHAR(50),
    owner_id INTEGER REFERENCES owners(id) ON DELETE SET NULL,
    bill_type VARCHAR(50) NOT NULL, -- 'Electricity', 'PTCL', 'Gas', 'Water'
    customer_id VARCHAR(100),
    consumer_number VARCHAR(100),
    account_number VARCHAR(100),
    reference_number VARCHAR(100),
    due_date DATE NOT NULL,
    bill_month VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Partial', 'Overdue'
    bill_amount DECIMAL(12, 2) DEFAULT 0,
    paid_by VARCHAR(50) DEFAULT 'Company', -- 'Company', 'Owner'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bills_building ON bills(building_number);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_type ON bills(bill_type);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_owner ON bills(owner_id);

-- ============================================
-- 3. RENT TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rent_tracking (
    id SERIAL PRIMARY KEY,
    building_number VARCHAR(50) NOT NULL,
    building_name VARCHAR(255),
    floor VARCHAR(50),
    unit_number VARCHAR(50),
    owner_id INTEGER REFERENCES owners(id) ON DELETE SET NULL,
    tenant_name VARCHAR(255),
    monthly_rent DECIMAL(12, 2),
    rent_month VARCHAR(20),
    paid_date DATE,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Partial'
    amount_paid DECIMAL(12, 2),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for rent tracking
CREATE INDEX IF NOT EXISTS idx_rent_building ON rent_tracking(building_number);
CREATE INDEX IF NOT EXISTS idx_rent_status ON rent_tracking(status);
CREATE INDEX IF NOT EXISTS idx_rent_month ON rent_tracking(rent_month);

-- ============================================
-- 4. MAINTENANCE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_items (
    id SERIAL PRIMARY KEY,
    building_number VARCHAR(50) NOT NULL,
    floor VARCHAR(50),
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed', 'Cancelled'
    assigned_to VARCHAR(255),
    cost DECIMAL(12, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for maintenance items
CREATE INDEX IF NOT EXISTS idx_maintenance_building ON maintenance_items(building_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_items(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_items(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_due_date ON maintenance_items(due_date);

-- ============================================
-- 5. COMMUNICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS communications (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES owners(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    method VARCHAR(50) DEFAULT 'Email', -- 'Email', 'Phone', 'SMS', 'In Person'
    date DATE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for communications
CREATE INDEX IF NOT EXISTS idx_communications_owner ON communications(owner_id);
CREATE INDEX IF NOT EXISTS idx_communications_date ON communications(date);
CREATE INDEX IF NOT EXISTS idx_communications_method ON communications(method);

-- ============================================
-- 6. UPDATED AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rent_tracking_updated_at BEFORE UPDATE ON rent_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_items_updated_at BEFORE UPDATE ON maintenance_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON communications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. INSERT INITIAL OWNERS DATA
-- ============================================
INSERT INTO owners (name, mobile, email, buildings, notes) VALUES
    ('Brig Shahid', '0323 4194444', 'shahid@grandcity.pk', ARRAY['170'], 'Owner of Building 170'),
    ('Fareed Faridi', '+92 312 4225106', 'fareed@grandcity.pk', ARRAY['171'], 'Owner of Building 171'),
    ('Waseem Ijaz', '+92 301 4681313', 'waseem@grandcity.pk', ARRAY['172'], 'Owner of Building 172'),
    ('Grand City HQ', '+92 300 1234567', 'hq@grandcity.pk', ARRAY['38', '129'], 'Additional Properties - Cantt View & 7 D')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. VIEW FOR BILL STATISTICS
-- ============================================
CREATE OR REPLACE VIEW bill_statistics AS
SELECT
    bill_type,
    status,
    COUNT(*) as count,
    SUM(bill_amount) as total_amount
FROM bills
GROUP BY bill_type, status;

-- ============================================
-- END OF SCHEMA
-- ============================================
