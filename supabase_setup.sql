-- SCRIPT COMPLETO DE CONFIGURAÇÃO SUPABASE - TVDE FLEET CRM
-- Este script cria TODAS as tabelas necessárias para o funcionamento do sistema.
-- Cole este script no SQL Editor do seu painel Supabase e clique em RUN.

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Empresas (Companies)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nif TEXT UNIQUE,
  email TEXT,
  address TEXT,
  iban TEXT,
  status TEXT DEFAULT 'active',
  plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  last_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Usuários (Users - Perfis de Admin/Gestor)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- master, admin, manager, finance
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Motoristas (Drivers)
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  nif TEXT,
  iban TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  category TEXT DEFAULT 'Economy',
  rating_uber DECIMAL(3,2) DEFAULT 5.0,
  rating_bolt DECIMAL(3,2) DEFAULT 5.0,
  acceptance_rate INTEGER DEFAULT 100,
  cancellation_rate INTEGER DEFAULT 0,
  commission_type TEXT DEFAULT 'fixed',
  commission_value DECIMAL(10,2) DEFAULT 0,
  bolt_id TEXT,
  uber_uuid TEXT,
  photo_url TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Veículos (Vehicles)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  plate TEXT UNIQUE NOT NULL,
  color TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  policy_number TEXT,
  insurance_expiry DATE,
  inspection_expiry DATE,
  entry_date DATE DEFAULT CURRENT_DATE,
  current_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Configurações da Empresa (Settings)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  nif TEXT,
  address TEXT,
  email TEXT,
  iban TEXT,
  bolt_client_id TEXT,
  bolt_client_secret TEXT,
  uber_client_id TEXT,
  uber_client_secret TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#151619',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Pagamentos/Acertos (Payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  platform TEXT, -- uber, bolt
  period_start DATE,
  period_end DATE,
  gross_revenue DECIMAL(10,2) DEFAULT 0,
  commission_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_date DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Despesas (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela de Aluguéis (Rentals)
CREATE TABLE IF NOT EXISTS rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'available',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabela de Auditoria (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID, -- Pode ser de users ou drivers
  user_name TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabela de Transfers
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  flight_number TEXT,
  passengers INTEGER DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabela de Entregas (Deliveries)
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  package_description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Tabela de Manutenções (Maintenances)
CREATE TABLE IF NOT EXISTS maintenances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  mileage INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Tabela de Sinistros (Claims)
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'reported',
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Tabela de Abastecimentos (Fuel Logs)
CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  odometer INTEGER,
  liters_or_kwh DECIMAL(10,2),
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Tabela de Notificações (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Habilitar RLS (Row Level Security) para todas as tabelas
-- Ignorar erros se já estiver habilitado
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY['companies', 'users', 'drivers', 'vehicles', 'settings', 'payments', 'expenses', 'rentals', 'audit_logs', 'transfers', 'deliveries', 'maintenances', 'claims', 'fuel_logs', 'notifications'];
BEGIN
    FOR t IN SELECT unnest(tables) LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 18. Criar Políticas de RLS (Acesso por company_id)
-- Estas políticas permitem que usuários vejam apenas dados da sua própria empresa.

-- Limpar políticas antigas para evitar erros de duplicado
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Política para Users (Cada um vê o seu perfil e admins veem todos da empresa)
CREATE POLICY "Users can see their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can see company users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.company_id = users.company_id AND u.role IN ('admin', 'master'))
);

-- Políticas Genéricas para tabelas vinculadas a company_id
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY['drivers', 'vehicles', 'settings', 'payments', 'expenses', 'rentals', 'audit_logs', 'transfers', 'deliveries', 'maintenances', 'claims', 'fuel_logs', 'notifications'];
BEGIN
    FOR t IN SELECT unnest(tables) LOOP
        -- Garantir que a coluna company_id existe antes de criar a política
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'company_id') THEN
            EXECUTE format('CREATE POLICY "Company access for %I" ON %I FOR ALL USING (
                EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.company_id = %I.company_id)
                OR 
                EXISTS (SELECT 1 FROM drivers d WHERE d.id = auth.uid() AND d.company_id = %I.company_id)
                OR
                EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = ''master'')
            )', t, t, t, t);
        END IF;
    END LOOP;
END $$;

-- Política especial para a tabela companies
CREATE POLICY "Users can see their own company" ON companies FOR SELECT USING (
  id IN (SELECT company_id FROM users WHERE id = auth.uid())
  OR 
  id IN (SELECT company_id FROM drivers WHERE id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'master')
);
