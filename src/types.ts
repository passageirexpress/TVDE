export interface Driver {
  id: string;
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
  brand: string;
  model: string;
  year: number;
  plate: string;
  category: string;
  entry_date: string;
  insurance_expiry: string;
  inspection_expiry: string;
  insurance?: string; // Legacy field for compatibility
  inspection?: string; // Legacy field for compatibility
  driver?: string; // Legacy field for compatibility
  policy_number: string;
  status: 'active' | 'maintenance' | 'inactive';
  current_driver_id?: string;
  documents: VehicleDocument[];
  history?: {
    date: string;
    type: string;
    description: string;
    cost: number;
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
  driver_id: string;
  period_start: string;
  period_end: string;
  gross_revenue: number;
  commission_fee: number; // 25%
  net_amount: number;
  status: 'pending' | 'paid' | 'processing';
  payment_date?: string;
  receipt_url?: string;
}

export interface EarningImport {
  id: string;
  driver_id: string;
  platform: 'uber' | 'bolt';
  amount: number;
  week_start: string;
  week_end: string;
  processed: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'finance' | 'driver';
  full_name: string;
  password?: string;
  permissions?: string[];
}

export interface Expense {
  id: string;
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
  name: string;
  nif: string;
  address: string;
  email: string;
  iban: string;
  bolt_client_id?: string;
  bolt_client_secret?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}
