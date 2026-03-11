export type PlanType = 'free' | 'pro' | 'enterprise';

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
  current_km?: number;
  next_maintenance_km?: number;
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
  signature_url?: string;
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
  role: 'master' | 'admin' | 'manager' | 'finance' | 'driver' | 'passenger';
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
  logo_url?: string;
  primary_color?: string;
  transfer_price_per_km?: number;
  transfer_price_per_min?: number;
  vat_rate?: number;
  delivery_base_price?: number;
  delivery_price_per_km?: number;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  timestamp: string;
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
  status?: 'pending' | 'completed' | 'canceled';
  created_at?: string;
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
  created_at?: string;
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

export interface Client {
  id: string;
  company_id: string;
  name: string;
  nif?: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'hotel' | 'agency' | 'restaurant' | 'individual' | 'corporate';
  created_at: string;
}

export interface Transfer {
  id: string;
  company_id: string;
  client_id?: string;
  driver_id?: string;
  vehicle_id?: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_at: string;
  flight_number?: string;
  flight_status?: 'on_time' | 'delayed' | 'landed' | 'unknown';
  estimated_arrival?: string;
  passengers: number;
  price: number;
  distance_km?: number;
  estimated_duration_min?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  notes?: string;
  completed_at?: string;
  proof_url?: string;
  signature_url?: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  company_id: string;
  client_id?: string;
  driver_id?: string;
  vehicle_id?: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_at: string;
  package_description?: string;
  priority: 'low' | 'normal' | 'urgent';
  price: number;
  distance_km?: number;
  estimated_duration_min?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  notes?: string;
  completed_at?: string;
  proof_url?: string;
  signature_url?: string;
  created_at: string;
}

export interface FuelLog {
  id: string;
  company_id: string;
  vehicle_id: string;
  driver_id: string;
  date: string;
  odometer: number;
  liters_or_kwh: number;
  total_cost: number;
  location?: string;
  receipt_url?: string;
  created_at: string;
}

export interface Affiliate {
  id: string;
  referrer_company_id: string;
  referred_company_id: string;
  status: 'pending' | 'active' | 'paid';
  commission_amount: number;
  created_at: string;
}

export interface Penalty {
  id: string;
  driver_id: string;
  vehicle_id: string;
  amount: number;
  description: string;
  date: string;
  status: 'pendente' | 'pago';
  company_id?: string;
  created_at?: string;
}

export interface Trip {
  id: string;
  passenger_id: string;
  driver_id: string;
  vehicle_id: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  origin_address: string;
  dest_address: string;
  status: 'requested' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  estimated_price: number;
  final_price?: number;
  waiting_time_minutes?: number;
  waiting_cost?: number;
  is_delivery?: boolean;
  delivery_type?: 'light' | 'heavy';
  company_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface Rating {
  id: string;
  trip_id: string;
  rater_id: string;
  rated_id: string;
  score: number;
  comment?: string;
  created_at: string;
}

export interface DeliveryPoint {
  id: string;
  company_id?: string;
  name: string;
  address: string;
  type: 'restaurant' | 'commercial_center' | 'supermarket' | 'other';
  city: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
}
