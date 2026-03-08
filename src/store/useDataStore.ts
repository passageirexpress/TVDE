import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Driver, Vehicle, Expense, Rental, User, CompanySettings, AppNotification, Payment, EarningImport, Company, Maintenance, Claim, InventoryItem, ChatMessage, Contract, Affiliate, Client, Transfer, Delivery, FuelLog } from '../types';
import { driversData } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';
import { sendEmailNotification } from '../services/notificationService';

interface DataState {
  companies: Company[];
  drivers: Driver[];
  vehicles: Vehicle[];
  expenses: Expense[];
  rentals: Rental[];
  users: User[];
  payments: Payment[];
  earningImports: EarningImport[];
  notifications: AppNotification[];
  maintenances: Maintenance[];
  claims: Claim[];
  inventoryItems: InventoryItem[];
  chatMessages: ChatMessage[];
  contracts: Contract[];
  clients: Client[];
  transfers: Transfer[];
  deliveries: Delivery[];
  fuelLogs: FuelLog[];
  affiliates: Affiliate[];
  settings: CompanySettings;
  auditLogs: AuditLog[];
  isLoading: boolean;
  
  // Companies
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;

  // Clients
  addClient: (client: Client) => void;
  updateClient: (id: string, updated: Partial<Client>) => void;

  // Transfers
  addTransfer: (transfer: Transfer) => void;
  updateTransfer: (id: string, updated: Partial<Transfer>) => void;

  // Deliveries
  addDelivery: (delivery: Delivery) => void;
  updateDelivery: (id: string, updated: Partial<Delivery>) => void;

  // Fuel Logs
  addFuelLog: (log: FuelLog) => void;
  
  // Notifications
  addNotification: (notification: AppNotification) => void;
  markNotificationsAsRead: () => void;
  
  // Payments
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updatedPayment: Partial<Payment>) => void;
  
  // Earnings
  addEarningImport: (earning: EarningImport) => void;
  syncDriverEarnings: (driverId: string) => void;
  
  // Drivers
  setDrivers: (drivers: Driver[]) => void;
  addDriver: (driver: Driver) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  
  // Vehicles
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  
  // Maintenance
  addMaintenance: (maintenance: Maintenance) => void;
  updateMaintenance: (id: string, maintenance: Partial<Maintenance>) => void;
  
  // Claims
  addClaim: (claim: Claim) => void;
  updateClaim: (id: string, claim: Partial<Claim>) => void;
  
  // Inventory
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  
  // Chat
  addChatMessage: (message: ChatMessage) => void;
  
  // Contracts
  addContract: (contract: Contract) => void;
  updateContract: (id: string, contract: Partial<Contract>) => void;
  
  // Affiliates
  addAffiliate: (affiliate: Affiliate) => void;
  updateAffiliate: (id: string, affiliate: Partial<Affiliate>) => void;
  
  // Expenses
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  
  // Rentals
  setRentals: (rentals: Rental[]) => void;
  addRental: (rental: Rental) => void;
  updateRental: (id: string, rental: Partial<Rental>) => void;
  
  // Users
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  
  // Settings
  updateSettings: (settings: Partial<CompanySettings>) => void;
  
  // Audit Logs
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'company_id'>) => Promise<void>;
  
  // Global Actions
  rehydrateData: () => void;
  resetEarnings: () => void;
  clearAllData: () => void;
  approveRental: (rentalId: string, driverId: string, driverName: string) => void;
  rejectRental: (rentalId: string, driverName: string) => void;
  calculateDriverSettlement: (driverId: string, periodStart: string, periodEnd: string) => Payment | null;
  
  // Supabase Sync
  fetchFromSupabase: () => Promise<void>;
  saveToSupabase: (table: string, data: any) => Promise<void>;
  uploadDocument: (file: File, path: string) => Promise<string>;
  createUserAuth: (data: any) => Promise<void>;
  subscribeToRealtime: () => () => void;
}

const initialVehicles: Vehicle[] = [
  { 
    id: '1', 
    brand: 'Toyota', 
    model: 'Corolla', 
    year: 2022, 
    plate: 'AA-11-BB', 
    color: 'Branco',
    category: 'Economy', 
    status: 'active', 
    entry_date: '2023-01-01', 
    insurance_expiry: '2024-12-31', 
    inspection_expiry: '2024-12-31', 
    policy_number: '123',
    current_driver_id: '1',
    documents: [],
    maintenance_history: [],
    claims: [],
    inventory: [],
    rental_history: [
      { driver_name: 'João Silva', start_date: '2023-01-01', end_date: '2023-12-31' },
      { driver_name: 'Maria Santos', start_date: '2024-01-01', end_date: '2024-02-15' }
    ]
  },
  { 
    id: '2', 
    brand: 'Mercedes', 
    model: 'E-Class', 
    year: 2023, 
    plate: 'CC-22-DD', 
    color: 'Preto',
    category: 'Black', 
    status: 'active', 
    entry_date: '2023-01-01', 
    insurance_expiry: '2024-03-15', 
    inspection_expiry: '2024-03-20', 
    policy_number: '124',
    current_driver_id: '2',
    documents: [],
    maintenance_history: [],
    claims: [],
    inventory: [],
    rental_history: [
      { driver_name: 'Carlos Oliveira', start_date: '2023-01-01', end_date: '2023-06-30' },
      { driver_name: 'Ana Costa', start_date: '2023-07-01', end_date: '2023-12-31' }
    ]
  },
  { 
    id: '3', 
    brand: 'Tesla', 
    model: 'Model 3', 
    year: 2023, 
    plate: 'EE-33-FF', 
    color: 'Azul',
    category: 'Black', 
    status: 'maintenance', 
    entry_date: '2023-01-01', 
    insurance_expiry: '2024-12-31', 
    inspection_expiry: '2024-12-31', 
    policy_number: '125',
    documents: [],
    maintenance_history: [],
    claims: [],
    inventory: [],
    rental_history: [
      { driver_name: 'Ricardo Pereira', start_date: '2023-01-01', end_date: '2023-12-31' }
    ]
  },
];

const initialExpenses: Expense[] = [
  { id: '1', category: 'combustivel', amount: 45.50, date: '2024-02-20', description: 'Abastecimento Galp', status: 'approved', driver_id: '1' },
  { id: '2', category: 'portagem', amount: 12.30, date: '2024-02-21', description: 'Via Verde A1', status: 'approved', driver_id: '1' },
  { id: '3', category: 'iva', amount: 150.00, date: '2024-02-15', description: 'IVA Trimestral', status: 'pending', driver_id: '2' },
  { id: '4', category: 'aluguel', amount: 200.00, date: '2024-02-01', description: 'Aluguel Semanal Viatura', status: 'approved', driver_id: '1' },
];

const initialRentals: Rental[] = [
  { id: '1', vehicle_id: '1', daily_rate: 35.00, status: 'available', interested_drivers: ['João Silva', 'Maria Santos'] },
  { id: '2', vehicle_id: '2', daily_rate: 65.00, status: 'available', interested_drivers: [] },
  { id: '3', vehicle_id: '3', daily_rate: 55.00, status: 'maintenance', interested_drivers: [] },
];

const initialUsers: User[] = [
  {
    id: '1',
    full_name: 'Admin Fleet',
    email: 'admin@tvdefleet.com',
    role: 'admin',
    permissions: ['all']
  }
];

const initialSettings: CompanySettings = {
  name: 'Sua Empresa TVDE',
  nif: '000000000',
  address: 'Endereço da Empresa',
  email: 'seu-email@empresa.pt',
  iban: 'PT50 0000 0000 0000 0000 0000 0',
  bolt_client_id: '',
  bolt_client_secret: '',
  uber_client_id: '',
  uber_client_secret: ''
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      companies: [],
      drivers: [],
      vehicles: [],
      expenses: [],
      rentals: [],
      users: [],
      payments: [],
      earningImports: [],
      notifications: [],
      maintenances: [],
      claims: [],
      inventoryItems: [],
      chatMessages: [],
      contracts: [],
      clients: [],
      transfers: [],
      deliveries: [],
      fuelLogs: [],
      affiliates: [],
      auditLogs: [],
      settings: initialSettings,
      isLoading: false,

      // Companies
      setCompanies: (companies) => set({ 
        companies: companies.map(c => ({
          ...c,
          plan: c.plan || 'free',
          subscription_status: c.subscription_status || 'active'
        }))
      }),
      addCompany: (company) => {
        const companyWithDefaults = {
          ...company,
          plan: company.plan || 'free',
          subscription_status: company.subscription_status || 'active'
        };
        set((state) => ({ companies: [companyWithDefaults, ...state.companies] }));
        get().saveToSupabase('companies', companyWithDefaults);
      },
      updateCompany: (id, updatedCompany) => {
        set((state) => {
          const companies = state.companies.map((c) => (c.id === id ? { ...c, ...updatedCompany } : c));
          const updated = companies.find(c => c.id === id);
          if (updated) get().saveToSupabase('companies', updated);
          return { companies };
        });
      },

      // Clients
      addClient: (client) => {
        set((state) => ({ clients: [client, ...state.clients] }));
        get().saveToSupabase('clients', client);
      },
      updateClient: (id, updated) => {
        set((state) => {
          const clients = state.clients.map((c) => (c.id === id ? { ...c, ...updated } : c));
          const item = clients.find(c => c.id === id);
          if (item) get().saveToSupabase('clients', item);
          return { clients };
        });
      },

      // Transfers
      addTransfer: (transfer) => {
        set((state) => ({ transfers: [transfer, ...state.transfers] }));
        get().saveToSupabase('transfers', transfer);
      },
      updateTransfer: (id, updated) => {
        set((state) => {
          const transfers = state.transfers.map((t) => (t.id === id ? { ...t, ...updated } : t));
          const item = transfers.find(t => t.id === id);
          if (item) get().saveToSupabase('transfers', item);
          return { transfers };
        });
      },

      // Deliveries
      addDelivery: (delivery) => {
        set((state) => ({ deliveries: [delivery, ...state.deliveries] }));
        get().saveToSupabase('deliveries', delivery);
      },
      updateDelivery: (id, updated) => {
        set((state) => {
          const deliveries = state.deliveries.map((d) => (d.id === id ? { ...d, ...updated } : d));
          const item = deliveries.find(d => d.id === id);
          if (item) get().saveToSupabase('deliveries', item);
          return { deliveries };
        });
      },

      // Fuel Logs
      addFuelLog: (log) => {
        set((state) => ({ fuelLogs: [log, ...state.fuelLogs] }));
        get().saveToSupabase('fuel_logs', log);
      },

      // Supabase Sync
      fetchFromSupabase: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true });
        try {
          const isMaster = user.role === 'master';
          const companyId = user.company_id;

          let driversQuery = supabase.from('drivers').select('*');
          let vehiclesQuery = supabase.from('vehicles').select('*');
          let expensesQuery = supabase.from('expenses').select('*');
          let rentalsQuery = supabase.from('rentals').select('*');
          let usersQuery = supabase.from('users').select('*');
          let paymentsQuery = supabase.from('payments').select('*');
          let earningImportsQuery = supabase.from('earning_imports').select('*');
          let settingsQuery = supabase.from('settings').select('id, company_id, name, nif, address, email, iban, bolt_client_id, uber_client_id, logo_url, primary_color, created_at, updated_at');
          let companiesQuery = supabase.from('companies').select('*');
          let maintenancesQuery = supabase.from('maintenances').select('*');
          let claimsQuery = supabase.from('claims').select('*');
          let inventoryItemsQuery = supabase.from('inventory_items').select('*');
          let chatMessagesQuery = supabase.from('chat_messages').select('*');
          let contractsQuery = supabase.from('contracts').select('*');
          let clientsQuery = supabase.from('clients').select('*');
          let transfersQuery = supabase.from('transfers').select('*');
          let deliveriesQuery = supabase.from('deliveries').select('*');
          let fuelLogsQuery = supabase.from('fuel_logs').select('*');
          let affiliatesQuery = supabase.from('affiliates').select('*');
          let auditLogsQuery = supabase.from('audit_logs').select('*');

          if (!isMaster && companyId) {
            driversQuery = driversQuery.eq('company_id', companyId);
            vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
            expensesQuery = expensesQuery.eq('company_id', companyId);
            rentalsQuery = rentalsQuery.eq('company_id', companyId);
            usersQuery = usersQuery.eq('company_id', companyId);
            paymentsQuery = paymentsQuery.eq('company_id', companyId);
            earningImportsQuery = earningImportsQuery.eq('company_id', companyId);
            settingsQuery = settingsQuery.eq('company_id', companyId);
            maintenancesQuery = maintenancesQuery.eq('company_id', companyId);
            claimsQuery = claimsQuery.eq('company_id', companyId);
            inventoryItemsQuery = inventoryItemsQuery.eq('company_id', companyId);
            chatMessagesQuery = chatMessagesQuery.eq('company_id', companyId);
            contractsQuery = contractsQuery.eq('company_id', companyId);
            clientsQuery = clientsQuery.eq('company_id', companyId);
            transfersQuery = transfersQuery.eq('company_id', companyId);
            deliveriesQuery = deliveriesQuery.eq('company_id', companyId);
            fuelLogsQuery = fuelLogsQuery.eq('company_id', companyId);
            affiliatesQuery = affiliatesQuery.eq('company_id', companyId);
            // Managers don't see other companies
          }

          const [
            drivers, vehicles, expenses, rentals, users, 
            payments, earningImports, settings, companies, 
            maintenances, claims, inventoryItems, chatMessages, 
            contracts, clients, transfers, deliveries, fuelLogs, affiliates
          ] = await Promise.all([
            driversQuery, vehiclesQuery, expensesQuery, rentalsQuery, usersQuery,
            paymentsQuery, earningImportsQuery, settingsQuery, 
            isMaster ? companiesQuery : Promise.resolve({ data: [] }),
            maintenancesQuery, claimsQuery, inventoryItemsQuery, chatMessagesQuery,
            contractsQuery, clientsQuery, transfersQuery, deliveriesQuery, fuelLogsQuery, affiliatesQuery
          ]);

          const [auditLogs] = await Promise.all([
            auditLogsQuery
          ]);

          if (drivers.data) set({ drivers: drivers.data });
          if (vehicles.data) set({ vehicles: vehicles.data });
          if (expenses.data) set({ expenses: expenses.data });
          if (rentals.data) set({ rentals: rentals.data });
          if (users.data) set({ users: users.data });
          if (payments.data) set({ payments: payments.data });
          if (earningImports.data) set({ earningImports: earningImports.data });
          if (settings.data && settings.data.length > 0) set({ settings: settings.data[0] });
          if (companies.data) set({ companies: companies.data });
          if (maintenances.data) set({ maintenances: maintenances.data });
          if (claims.data) set({ claims: claims.data });
          if (inventoryItems.data) set({ inventoryItems: inventoryItems.data });
          if (chatMessages.data) set({ chatMessages: chatMessages.data });
          if (contracts.data) set({ contracts: contracts.data });
          if (clients.data) set({ clients: clients.data });
          if (transfers.data) set({ transfers: transfers.data });
          if (deliveries.data) set({ deliveries: deliveries.data });
          if (fuelLogs.data) set({ fuelLogs: fuelLogs.data });
          if (affiliates.data) set({ affiliates: affiliates.data });
          if (auditLogs.data) set({ auditLogs: auditLogs.data });
        } catch (error) {
          console.error('Error fetching from Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveToSupabase: async (table: string, data: any) => {
        const user = useAuthStore.getState().user;
        const payload = { ...data };
        
        // Automatically add company_id if missing and user is not master
        if (table !== 'companies' && table !== 'users' && user?.company_id && !payload.company_id) {
          payload.company_id = user.company_id;
        }

        try {
          // Use backend proxy for companies table if user is master to bypass RLS issues
          if (table === 'companies' && user?.role === 'master') {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/companies/upsert', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
              },
              body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Erro ao salvar empresa via API');
            return;
          }

          const { error } = await supabase.from(table).upsert(payload);
          if (error) {
            console.error(`Supabase Upsert Error (${table}):`, error);
            // If it's a permission error and we are master, we might need to use the admin API
            // but we can't do that from client. We should warn the user.
            if (error.code === '42501') {
              toast.error(`Erro de permissão ao salvar em ${table}. Verifique as políticas de RLS no Supabase.`);
            }
            throw error;
          }
        } catch (error) {
          console.error(`Error saving to Supabase table ${table}:`, error);
        }
      },

      uploadDocument: async (file: File, path: string) => {
        const user = useAuthStore.getState().user;
        if (!user?.company_id) throw new Error('Empresa não identificada');

        const fullPath = `${user.company_id}/${path}`;
        
        try {
          const { data, error } = await supabase.storage
            .from('documents')
            .upload(fullPath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(data.path);

          return publicUrl;
        } catch (error: any) {
          console.error('Error uploading document:', error);
          throw error;
        }
      },

      createUserAuth: async (data: any) => {
        const user = useAuthStore.getState().user;
        const payload = { 
          ...data,
          company_id: data.company_id || user?.company_id
        };

        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          const response = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Erro ao criar usuário');
          
          // Refresh data after creation
          await get().fetchFromSupabase();
        } catch (error: any) {
          console.error('Error creating user auth:', error);
          throw error;
        }
      },

      subscribeToRealtime: () => {
        const user = useAuthStore.getState().user;
        if (!user || !user.company_id) return () => {};

        const channel = supabase
          .channel('db-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'claims',
              filter: `company_id=eq.${user.company_id}`
            },
            (payload) => {
              const newClaim = payload.new as Claim;
              set((state) => ({ claims: [newClaim, ...state.claims] }));
              
              // Only notify admins
              if (user.role !== 'driver') {
                const vehicle = get().vehicles.find(v => v.id === newClaim.vehicle_id);
                toast.error(`NOVO SINISTRO: Viatura ${vehicle?.plate || ''}`, {
                  description: newClaim.description,
                  duration: 10000,
                });
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `company_id=eq.${user.company_id}`
            },
            (payload) => {
              const newNotification = payload.new as AppNotification;
              set((state) => ({ notifications: [newNotification, ...state.notifications] }));
              
              if (!newNotification.read) {
                toast.info(newNotification.title, {
                  description: newNotification.message,
                });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },

      // Earnings
      addEarningImport: (earning) => {
        set((state) => ({ earningImports: [earning, ...state.earningImports] }));
        get().saveToSupabase('earning_imports', earning);
      },
      syncDriverEarnings: (driverId) => {
        const state = get();
        const driver = state.drivers.find(d => d.id === driverId);
        if (!driver) return;

        const driverImports = state.earningImports.filter(ei => 
          ei.driver_id === driverId && !ei.processed
        );

        if (driverImports.length === 0) return;

        const totalGross = driverImports.reduce((acc, curr) => acc + curr.amount, 0);
        const commission = totalGross * 0.25;
        const net = totalGross - commission;

        const newPayment: Payment = {
          id: crypto.randomUUID(),
          driver_id: driverId,
          driver: driver.full_name,
          period_start: driverImports[0].week_start,
          period_end: driverImports[0].week_end,
          period: `${driverImports[0].week_start} - ${driverImports[0].week_end}`,
          gross_revenue: totalGross,
          gross: totalGross,
          commission_fee: commission,
          net_amount: net,
          net: net,
          status: 'pending',
          payment_date: new Date().toISOString().split('T')[0],
          date: new Date().toISOString().split('T')[0]
        };

        const updatedImports = state.earningImports.map(ei => 
          ei.driver_id === driverId ? { ...ei, processed: true } : ei
        );

        set({
          payments: [newPayment, ...state.payments],
          earningImports: updatedImports
        });

        state.saveToSupabase('payments', newPayment);
        // Update processed status for all imports in this batch
        driverImports.forEach(ei => {
          state.saveToSupabase('earning_imports', { ...ei, processed: true });
        });
      },

      // Global Actions
      rehydrateData: () => {
        const state = get();
        state.fetchFromSupabase();
        
        const needsRehydration = state.users.length === 0 || state.drivers.length === 0;
        
        if (!needsRehydration) {
          return;
        }
      },

      // Notifications
      addNotification: (n) => {
        set((state) => ({ notifications: [n, ...state.notifications] }));
        
        // Send email notification to all admins
        const state = get();
        const admins = state.users.filter(u => u.role === 'admin' && u.email);
        
        admins.forEach(admin => {
          if (admin.email) {
            sendEmailNotification(
              admin.email,
              n.title,
              n.message,
              state.settings?.name || 'TVDE Fleet'
            );
          }
        });
      },
      markNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      // Payments
      setPayments: (payments) => set({ payments }),
      addPayment: (payment) => {
        set((state) => ({ payments: [payment, ...state.payments] }));
        get().saveToSupabase('payments', payment);
      },
      updatePayment: (id, updatedPayment) => {
        set((state) => {
          const payments = state.payments.map((p) => (p.id === id ? { ...p, ...updatedPayment } : p));
          const updated = payments.find(p => p.id === id);
          if (updated) get().saveToSupabase('payments', updated);
          return { payments };
        });
      },

      // Drivers
      setDrivers: (drivers) => set({ drivers }),
      addDriver: (driver) => {
        set((state) => ({ drivers: [driver, ...state.drivers] }));
        get().saveToSupabase('drivers', driver);
      },
      updateDriver: (id, updatedDriver) => {
        set((state) => {
          const drivers = state.drivers.map((d) => (d.id === id ? { ...d, ...updatedDriver } : d));
          const updated = drivers.find(d => d.id === id);
          if (updated) get().saveToSupabase('drivers', updated);
          return { drivers };
        });
      },

      // Vehicles
      setVehicles: (vehicles) => set({ vehicles }),
      addVehicle: (vehicle) => {
        set((state) => ({ vehicles: [vehicle, ...state.vehicles] }));
        get().saveToSupabase('vehicles', vehicle);
      },
      updateVehicle: (id, updatedVehicle) => {
        set((state) => {
          const vehicles = state.vehicles.map((v) => (v.id === id ? { ...v, ...updatedVehicle } : v));
          const updated = vehicles.find(v => v.id === id);
          if (updated) get().saveToSupabase('vehicles', updated);
          return { vehicles };
        });
      },

      // Expenses
      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) => {
        set((state) => ({ expenses: [expense, ...state.expenses] }));
        get().saveToSupabase('expenses', expense);

        // Notify admins if expense is pending
        if (expense.status === 'pending') {
          const state = get();
          const driver = state.drivers.find(d => d.id === expense.driver_id);
          const title = `Nova Despesa Pendente: ${driver?.full_name || 'Motorista'}`;
          const message = `O motorista ${driver?.full_name} registou uma nova despesa de ${expense.amount}€ (${expense.category}).\n\nPor favor, valide no painel de despesas.`;
          
          get().addNotification({
            id: `expense-new-${expense.id}`,
            title,
            message,
            date: new Date().toISOString().split('T')[0],
            read: false
          });
        }
      },
      updateExpense: (id, updatedExpense) => {
        set((state) => {
          const expenses = state.expenses.map((e) => (e.id === id ? { ...e, ...updatedExpense } : e));
          const updated = expenses.find(e => e.id === id);
          if (updated) get().saveToSupabase('expenses', updated);
          return { expenses };
        });
      },

      // Rentals
      setRentals: (rentals) => set({ rentals }),
      addRental: (rental) => {
        set((state) => ({ rentals: [rental, ...state.rentals] }));
        get().saveToSupabase('rentals', rental);
      },
      updateRental: (id, updatedRental) => {
        set((state) => {
          const oldRental = state.rentals.find(r => r.id === id);
          const rentals = state.rentals.map((r) => (r.id === id ? { ...r, ...updatedRental } : r));
          const updated = rentals.find(r => r.id === id);
          
          // If a driver just rented a vehicle, notify admins
          if (oldRental?.status === 'available' && updated?.status === 'rented' && updated?.driver_id) {
            const driver = state.drivers.find(d => d.id === updated.driver_id);
            const vehicle = state.vehicles.find(v => v.id === updated.vehicle_id);
            const title = `Novo Aluguel: ${vehicle?.plate}`;
            const message = `O motorista ${driver?.full_name} alugou o veículo ${vehicle?.plate}.\n\nInício: ${updated.start_date}`;
            
            // Use setTimeout to avoid state updates during render if this is called in a component
            setTimeout(() => {
              get().addNotification({
                id: `rental-new-${id}`,
                title,
                message,
                date: new Date().toISOString().split('T')[0],
                read: false
              });
            }, 0);
          }

          if (updated) get().saveToSupabase('rentals', updated);
          return { rentals };
        });
      },

      // Maintenance
      addMaintenance: (maintenance) => {
        set((state) => ({ maintenances: [maintenance, ...state.maintenances] }));
        get().saveToSupabase('maintenances', maintenance);
      },
      updateMaintenance: (id, updated) => {
        set((state) => {
          const maintenances = state.maintenances.map((m) => (m.id === id ? { ...m, ...updated } : m));
          const item = maintenances.find(m => m.id === id);
          if (item) get().saveToSupabase('maintenances', item);
          return { maintenances };
        });
      },

      // Claims
      addClaim: (claim) => {
        set((state) => ({ claims: [claim, ...state.claims] }));
        get().saveToSupabase('claims', claim);

        // Notify all admins about new claim
        const state = get();
        const admins = state.users.filter(u => u.role === 'admin' && u.email);
        const vehicle = state.vehicles.find(v => v.id === claim.vehicle_id);
        const driver = state.drivers.find(d => d.id === claim.driver_id);
        
        const title = `Novo Sinistro Reportado: ${vehicle?.plate || 'Veículo Desconhecido'}`;
        const message = `Um novo sinistro foi reportado.\n\nVeículo: ${vehicle?.plate}\nMotorista: ${driver?.full_name}\nData: ${claim.date}\nDescrição: ${claim.description}\n\nPor favor, verifique o sistema para mais detalhes.`;

        admins.forEach(admin => {
          if (admin.email) {
            sendEmailNotification(
              admin.email,
              title,
              message,
              state.settings?.name || 'TVDE Fleet'
            );
          }
        });
      },
      updateClaim: (id, updated) => {
        set((state) => {
          const claims = state.claims.map((c) => (c.id === id ? { ...c, ...updated } : c));
          const item = claims.find(c => c.id === id);
          if (item) get().saveToSupabase('claims', item);
          return { claims };
        });
      },

      // Inventory
      addInventoryItem: (item) => {
        set((state) => ({ inventoryItems: [item, ...state.inventoryItems] }));
        get().saveToSupabase('inventory_items', item);
      },
      updateInventoryItem: (id, updated) => {
        set((state) => {
          const inventoryItems = state.inventoryItems.map((i) => (i.id === id ? { ...i, ...updated } : i));
          const item = inventoryItems.find(i => i.id === id);
          if (item) get().saveToSupabase('inventory_items', item);
          return { inventoryItems };
        });
      },

      // Chat
      addChatMessage: (message) => {
        set((state) => ({ chatMessages: [message, ...state.chatMessages] }));
        get().saveToSupabase('chat_messages', message);
      },

      // Contracts
      addContract: (contract) => {
        set((state) => ({ contracts: [contract, ...state.contracts] }));
        get().saveToSupabase('contracts', contract);
      },
      updateContract: (id, updated) => {
        set((state) => {
          const contracts = state.contracts.map((c) => (c.id === id ? { ...c, ...updated } : c));
          const item = contracts.find(c => c.id === id);
          if (item) get().saveToSupabase('contracts', item);
          return { contracts };
        });
      },

      // Affiliates
      addAffiliate: (affiliate) => {
        set((state) => ({ affiliates: [affiliate, ...state.affiliates] }));
        get().saveToSupabase('affiliates', affiliate);
      },
      updateAffiliate: (id, updated) => {
        set((state) => {
          const affiliates = state.affiliates.map((a) => (a.id === id ? { ...a, ...updated } : a));
          const item = affiliates.find(a => a.id === id);
          if (item) get().saveToSupabase('affiliates', item);
          return { affiliates };
        });
      },

      // Users
      setUsers: (users) => set({ users }),
      addUser: (user) => {
        set((state) => ({ users: [user, ...state.users] }));
        get().saveToSupabase('users', user);
      },
      updateUser: (id, updatedUser) => {
        set((state) => {
          const users = state.users.map((u) => (u.id === id ? { ...u, ...updatedUser } : u));
          const updated = users.find(u => u.id === id);
          if (updated) get().saveToSupabase('users', updated);
          return { users };
        });
      },

      // Settings
      updateSettings: (updatedSettings) => {
        set((state) => {
          const settings = { ...state.settings, ...updatedSettings };
          get().saveToSupabase('settings', settings);
          return { settings };
        });
      },

      addAuditLog: async (logData) => {
        const user = useAuthStore.getState().user;
        if (!user?.company_id) return;

        const newLog: AuditLog = {
          id: crypto.randomUUID(),
          company_id: user.company_id,
          user_id: user.id,
          user_name: user.full_name || 'Sistema',
          timestamp: new Date().toISOString(),
          ...logData
        };

        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
        await get().saveToSupabase('audit_logs', newLog);
      },

      // Global Actions
      resetEarnings: () => set((state) => ({
        expenses: state.expenses.filter(e => e.category !== 'aluguel'), // Keep other expenses but maybe reset payments?
      })),

      clearAllData: () => set({
        drivers: [],
        vehicles: [],
        expenses: [],
        rentals: [],
        payments: [],
        users: initialUsers,
      }),

      approveRental: (rentalId, driverId, driverName) => set((state) => {
        const rental = state.rentals.find(r => r.id === rentalId);
        if (!rental) return state;

        const weeklyCost = rental.daily_rate * 7;
        const newExpense: Expense = {
          id: crypto.randomUUID(),
          driver_id: driverId,
          category: 'aluguel',
          amount: weeklyCost,
          date: new Date().toISOString().split('T')[0],
          description: `Aluguel Semanal - Viatura ${state.vehicles.find(v => v.id === rental.vehicle_id)?.plate}`,
          status: 'approved'
        };

        return {
          rentals: state.rentals.map(r => r.id === rentalId ? { 
            ...r, 
            status: 'rented', 
            driver_id: driverId, 
            interested_drivers: r.interested_drivers?.filter(d => d !== driverName) 
          } : r),
          vehicles: state.vehicles.map(v => v.id === rental.vehicle_id ? { ...v, current_driver_id: driverId, status: 'active' } : v),
          expenses: [newExpense, ...state.expenses]
        };
      }),

      rejectRental: (rentalId, driverName) => set((state) => ({
        rentals: state.rentals.map(r => r.id === rentalId ? { 
          ...r, 
          interested_drivers: r.interested_drivers?.filter(d => d !== driverName) 
        } : r)
      })),

      calculateDriverSettlement: (driverId, periodStart, periodEnd) => {
        const state = get();
        const driver = state.drivers.find(d => d.id === driverId);
        if (!driver) return null;

        // 1. Get all earnings for this driver in this period
        const driverEarnings = state.earningImports.filter(ei => 
          ei.driver_id === driverId && 
          ei.week_start === periodStart && 
          ei.week_end === periodEnd
        );

        const totalGross = driverEarnings.reduce((acc, curr) => acc + curr.amount, 0);
        
        // 2. Calculate company commission
        const commission = driver.commission_type === 'fixed' 
          ? driver.commission_value 
          : totalGross * (driver.commission_value / 100);

        // 3. Get all approved expenses for this driver in this period
        const start = new Date(periodStart).getTime();
        const end = new Date(periodEnd).getTime();
        
        const driverExpenses = state.expenses.filter(e => {
          if (e.driver_id !== driverId || e.status !== 'approved') return false;
          const expenseDate = new Date(e.date).getTime();
          return expenseDate >= start && expenseDate <= end;
        });

        const totalExpenses = driverExpenses.reduce((acc, curr) => acc + curr.amount, 0);

        // 4. Check for vehicle rental in this period
        const activeRental = state.rentals.find(r => r.driver_id === driverId && r.status === 'rented');
        let rentalCost = 0;
        if (activeRental) {
          const days = 7; 
          rentalCost = activeRental.daily_rate * days;
        }

        const netAmount = totalGross - commission - totalExpenses - rentalCost;

        const settlement: Payment = {
          id: crypto.randomUUID(),
          driver_id: driverId,
          driver: driver.full_name,
          platform: 'uber',
          period_start: periodStart,
          period_end: periodEnd,
          period: `${periodStart} - ${periodEnd}`,
          gross_revenue: totalGross,
          gross: totalGross,
          commission_fee: commission,
          net_amount: netAmount,
          net: netAmount,
          status: 'pending',
          payment_date: new Date().toISOString().split('T')[0],
          date: new Date().toISOString().split('T')[0]
        };

        return settlement;
      },
    }),
    {
      name: 'tvde-fleet-data',
    }
  )
);
