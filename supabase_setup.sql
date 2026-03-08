-- SCRIPT DE CONFIGURAÇÃO SUPABASE - TVDE FLEET CRM
-- Cole este script no SQL Editor do seu painel Supabase para criar as tabelas necessárias.

-- 1. Habilitar extensão para UUIDs (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Auditoria (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN
  entity TEXT NOT NULL, -- VEHICLE, DRIVER, TRANSFER, etc.
  entity_id TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Atualizar Tabela de Configurações (Settings)
-- Nota: Se a tabela não existir, criamos. Se existir, adicionamos as colunas.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
        CREATE TABLE settings (
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
    ELSE
        ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
        ALTER TABLE settings ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#151619';
        ALTER TABLE settings ADD COLUMN IF NOT EXISTS bolt_client_id TEXT;
        ALTER TABLE settings ADD COLUMN IF NOT EXISTS bolt_client_secret TEXT;
        ALTER TABLE settings ADD COLUMN IF NOT EXISTS uber_client_id TEXT;
        ALTER TABLE settings ADD COLUMN IF NOT EXISTS uber_client_secret TEXT;
    END IF;
END $$;

-- 4. Atualizar Tabela de Empresas (Companies)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- 5. Tabela de Transfers
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  flight_number TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Entregas (Deliveries)
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  package_type TEXT,
  status TEXT DEFAULT 'pending',
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Manutenções (Maintenances)
CREATE TABLE IF NOT EXISTS maintenances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  cost DECIMAL(10,2),
  workshop TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Sinistros (Claims)
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'pending',
  photos TEXT[], -- Array de URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Abastecimentos (Fuel Logs)
CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  liters DECIMAL(10,2),
  amount DECIMAL(10,2) NOT NULL,
  odometer INTEGER,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Habilitar RLS (Row Level Security) para todas as novas tabelas
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

-- 10. Criar Políticas de RLS Básicas (Acesso por company_id)
-- Nota: Estas políticas assumem que o JWT do usuário contém o company_id nos metadados.
-- Se não contiver, as políticas podem precisar de ajuste para consultar a tabela 'users'.

CREATE POLICY "Empresas podem ver seus próprios logs" ON audit_logs
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE company_id = audit_logs.company_id));

CREATE POLICY "Empresas podem ver seus próprios transfers" ON transfers
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE company_id = transfers.company_id));

CREATE POLICY "Empresas podem ver suas próprias entregas" ON deliveries
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE company_id = deliveries.company_id));

CREATE POLICY "Empresas podem ver suas próprias manutenções" ON maintenances
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE company_id = maintenances.company_id));

CREATE POLICY "Empresas podem ver seus próprios sinistros" ON claims
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE company_id = claims.company_id));

CREATE POLICY "Empresas podem ver seus próprios abastecimentos" ON fuel_logs
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE company_id = fuel_logs.company_id));
