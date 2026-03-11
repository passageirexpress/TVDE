-- TVDE Fleet Management System Schema

-- Users Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'passenger')),
  company_id UUID,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nif TEXT UNIQUE NOT NULL,
  address TEXT,
  plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  nif TEXT,
  iban TEXT,
  address TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive', 'bloqueado')),
  rating DECIMAL(3,2) DEFAULT 5.0,
  acceptance_rate DECIMAL(5,2) DEFAULT 100.0,
  cancellation_rate DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  plate TEXT UNIQUE NOT NULL,
  vin TEXT UNIQUE,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'manutenção', 'inactive')),
  insurance_expiry DATE,
  inspection_expiry DATE,
  tvde_license_expiry DATE,
  current_km INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL, -- Can be driver_id or vehicle_id
  owner_type TEXT NOT NULL CHECK (owner_type IN ('driver', 'vehicle')),
  type TEXT NOT NULL, -- e.g., 'carta_conducao', 'seguro', 'licenca_tvde'
  url TEXT NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Earnings Table
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  company_id UUID REFERENCES companies(id),
  platform TEXT NOT NULL CHECK (platform IN ('Uber', 'Bolt', 'FreeNow')),
  gross_amount DECIMAL(10,2) NOT NULL,
  fleet_commission DECIMAL(10,2) NOT NULL, -- Usually 25%
  net_amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  company_id UUID REFERENCES companies(id),
  amount DECIMAL(10,2) NOT NULL,
  week_reference TEXT, -- e.g., '2024-W12'
  iban TEXT,
  receipt_url TEXT, -- Link to 'recibo verde'
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'pago')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Table
CREATE TABLE IF NOT EXISTS maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  type TEXT NOT NULL, -- 'óleo', 'pneus', 'revisão', 'travões'
  description TEXT,
  km_at_service INTEGER,
  next_service_km INTEGER,
  cost DECIMAL(10,2),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Penalties (Multas) Table
CREATE TABLE IF NOT EXISTS penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  origin_lat DECIMAL(9,6),
  origin_lng DECIMAL(9,6),
  dest_lat DECIMAL(9,6),
  dest_lng DECIMAL(9,6),
  origin_address TEXT,
  dest_address TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'ongoing', 'completed', 'cancelled')),
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  waiting_time_minutes INTEGER DEFAULT 0,
  waiting_cost DECIMAL(10,2) DEFAULT 0.0,
  is_delivery BOOLEAN DEFAULT FALSE,
  delivery_type TEXT, -- 'light', 'heavy'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT, -- 'payment', 'document', 'system'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Simplified for development)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all data" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
-- ... Add more specific RLS policies as needed ...
