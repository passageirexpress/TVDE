export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  nif: string;
  email?: string;
  address?: string;
  iban?: string;
  created_at: string;
  status: 'active' | 'inactive';
  plan: PlanType;
  subscription_status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  viva_customer_id?: string;
  viva_subscription_id?: string;
  last_payment_date?: string;
}

export interface Driver {
  id: string;
  company_id?: string;
  full_name: string;
  nif: string;
  iban: string;
  phone: string;
  email: string;
  entry_date: string;
  status: 'active' | 'inactive' | 'suspended';
  acceptance_rate: number;
  cancellation_rate: number;
  rating_uber: number;
  rating_bolt: number;
  category: string;
  photo_url?: string;
  documents: DriverDocument[];
  commission_type: 'fixed' | 'variable';
  commission_value: number;
  uber_uuid?: string;
  bolt_id?: string;
  password?: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  type: 'license' | 'tvde_cert' | 'id_card' | 'address_proof';
  url: string;
  expiry_date?: string;
  status: 'valid' | 'expired' | 'pending' | 'rejected';
}

export interface Vehicle {
  id: string;
  company_id?: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  category: string;
  entry_date: string;
  insurance_expiry: string;
  inspection_expiry: string;
  insurance?: string;
  inspection?: string;
  driver?: string;
  policy_number: string;
  status: 'active' | 'maintenance' | 'inactive';
  current_driver_id?: string;
  documents: VehicleDocument[];
  maintenance_history: Maintenance[];
  claims: Claim[];
  inventory: InventoryItem[];
  history?: {
    date: string;
    type: string;
    description: string;
    cost: number;
  }[];
  rental_history?: {
    driver_name: string;
    start_date: string;
    end_date: string;
  }[];
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  type: 'registration' | 'insurance' | 'green_card' | 'inspection';
  url: string;
  expiry_date: string;
  status: 'valid' | 'expired' | 'pending';
}

export interface Payment {
  id: string;
  company_id?: string;
  driver_id: string;
  platform?: 'uber' | 'bolt';
  period_start: string;
  period_end: string;
  gross_revenue: number;
  commission_fee: number; // 25%
  net_amount: number;
  status: 'pending' | 'paid' | 'processing';
  payment_date?: string;
  receipt_url?: string;
  // Legacy fields for compatibility
  driver?: string;
  gross?: number;
  net?: number;
  date?: string;
  period?: string;
}

export interface EarningImport {
  id: string;
  company_id?: string;
  driver_id: string;
  platform: 'uber' | 'bolt';
  amount: number;
  week_start: string;
  week_end: string;
  processed: boolean;
}

export interface User {
  id: string;
  company_id?: string; // Optional for master admins
  email: string;
  role: 'master' | 'admin' | 'manager' | 'finance' | 'driver';
  full_name: string;
  password?: string;
  permissions?: string[];
}

export interface Expense {
  id: string;
  company_id?: string;
  driver_id?: string;
  category: 'iva' | 'portagem' | 'combustivel' | 'aluguel' | 'outros';
  amount: number;
  date: string;
  description: string;
  iva_amount?: number;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Rental {
  id: string;
  company_id?: string;
  vehicle_id: string;
  driver_id?: string;
  daily_rate: number;
  security_deposit?: number;
  status: 'available' | 'rented' | 'maintenance';
  interested_drivers?: string[];
  start_date?: string;
  end_date?: string;
}

export interface CompanySettings {
  company_id?: string;
  name: string;
  nif: string;
  address: string;
  email: string;
  iban: string;
  bolt_client_id?: string;
  bolt_client_secret?: string;
  uber_client_id?: string;
  uber_client_secret?: string;
}

export interface AppNotification {
  id: string;
  company_id?: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  date: string;
  type: 'oil_change' | 'tires' | 'brakes' | 'general' | 'other';
  description: string;
  cost: number;
  mileage: number;
  next_maintenance_mileage?: number;
  receipt_url?: string;
}

export interface Claim {
  id: string;
  vehicle_id: string;
  driver_id: string;
  date: string;
  description: string;
  location: string;
  status: 'reported' | 'in_progress' | 'resolved' | 'rejected';
  photos: string[];
  report_url?: string;
}

export interface InventoryItem {
  id: string;
  vehicle_id: string;
  name: string;
  quantity: number;
  last_checked: string;
  status: 'ok' | 'missing' | 'damaged';
}

export interface ChatMessage {
  id: string;
  company_id: string;
  sender_id: string;
  receiver_id?: string; // If null, it's a broadcast or group chat
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Contract {
  id: string;
  company_id: string;
  driver_id: string;
  type: 'tvde_contract' | 'rental_agreement';
  status: 'draft' | 'sent' | 'signed' | 'expired';
  signed_at?: string;
  document_url: string;
}

export interface Affiliate {
  id: string;
  referrer_company_id: string;
  referred_company_id: string;
  status: 'pending' | 'active' | 'paid';
  commission_amount: number;
  created_at: string;
}
