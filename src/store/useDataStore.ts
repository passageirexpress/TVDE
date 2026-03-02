import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Driver, Vehicle, Expense, Rental, User, CompanySettings, AppNotification, Payment, EarningImport, Company } from '../types';
import { driversData } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

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
  settings: CompanySettings;
  isLoading: boolean;
  
  // Companies
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  
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
  
  // Global Actions
  rehydrateData: () => void;
  resetEarnings: () => void;
  clearAllData: () => void;
  approveRental: (rentalId: string, driverId: string, driverName: string) => void;
  rejectRental: (rentalId: string, driverName: string) => void;
  
  // Supabase Sync
  fetchFromSupabase: () => Promise<void>;
  saveToSupabase: (table: string, data: any) => Promise<void>;
  uploadDocument: (file: File, path: string) => Promise<string>;
  createUserAuth: (data: any) => Promise<void>;
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
    password: '1234',
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
      drivers: driversData,
      vehicles: initialVehicles,
      expenses: initialExpenses,
      rentals: initialRentals,
      users: initialUsers,
      payments: [
        { id: '1', company_id: '1', driver_id: '1', driver: 'João Silva', period: '16/02 - 23/02', period_start: '2026-02-16', period_end: '2026-02-23', gross_revenue: 600, gross: 600, commission_fee: 150, net_amount: 450, net: 450, status: 'paid', payment_date: '2026-02-23', date: '2026-02-23' },
        { id: '2', company_id: '1', driver_id: '2', driver: 'Maria Santos', period: '16/02 - 23/02', period_start: '2026-02-16', period_end: '2026-02-23', gross_revenue: 750, gross: 750, commission_fee: 187.5, net_amount: 562.5, net: 562.5, status: 'paid', payment_date: '2026-02-23', date: '2026-02-23' },
      ],
      earningImports: [
        { id: 'ei1', company_id: '1', driver_id: '1', platform: 'uber', amount: 420.50, week_start: '2026-02-23', week_end: '2026-03-02', processed: false },
        { id: 'ei2', company_id: '1', driver_id: '1', platform: 'bolt', amount: 180.20, week_start: '2026-02-23', week_end: '2026-03-02', processed: false },
      ],
      notifications: [
        { id: '1', company_id: '1', title: 'Bem-vindo ao TVDE Fleet', message: 'O seu sistema de gestão de frota está pronto a usar.', date: '2026-02-26', read: false },
        { id: '2', company_id: '1', title: 'Pagamento Processado', message: 'O pagamento da semana 16/02 foi concluído com sucesso.', date: '2026-02-23', read: true },
      ],
      settings: initialSettings,
      isLoading: false,

      // Companies
      setCompanies: (companies) => set({ companies }),
      addCompany: (company) => {
        set((state) => ({ companies: [company, ...state.companies] }));
        get().saveToSupabase('companies', company);
      },
      updateCompany: (id, updatedCompany) => {
        set((state) => {
          const companies = state.companies.map((c) => (c.id === id ? { ...c, ...updatedCompany } : c));
          const updated = companies.find(c => c.id === id);
          if (updated) get().saveToSupabase('companies', updated);
          return { companies };
        });
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
          let settingsQuery = supabase.from('settings').select('*');
          let companiesQuery = supabase.from('companies').select('*');

          if (!isMaster && companyId) {
            driversQuery = driversQuery.eq('company_id', companyId);
            vehiclesQuery = vehiclesQuery.eq('company_id', companyId);
            expensesQuery = expensesQuery.eq('company_id', companyId);
            rentalsQuery = rentalsQuery.eq('company_id', companyId);
            usersQuery = usersQuery.eq('company_id', companyId);
            paymentsQuery = paymentsQuery.eq('company_id', companyId);
            earningImportsQuery = earningImportsQuery.eq('company_id', companyId);
            settingsQuery = settingsQuery.eq('company_id', companyId);
            // Managers don't see other companies
          }

          const [
            { data: drivers },
            { data: vehicles },
            { data: expenses },
            { data: rentals },
            { data: users },
            { data: payments },
            { data: earningImports },
            { data: settings },
            { data: companies }
          ] = await Promise.all([
            driversQuery,
            vehiclesQuery,
            expensesQuery,
            rentalsQuery,
            usersQuery,
            paymentsQuery,
            earningImportsQuery,
            settingsQuery,
            isMaster ? companiesQuery : Promise.resolve({ data: [] })
          ]);

          if (drivers) set({ drivers });
          if (vehicles) set({ vehicles });
          if (expenses) set({ expenses });
          if (rentals) set({ rentals });
          if (users) set({ users });
          if (payments) set({ payments });
          if (earningImports) set({ earningImports });
          if (settings && settings.length > 0) set({ settings: settings[0] });
          if (companies) set({ companies });
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
              alert(`Erro de permissão ao salvar em ${table}. Verifique as políticas de RLS no Supabase.`);
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
        
        const needsPasswordUpdate = state.users.some(u => u.password === 'admin') || 
                                   state.drivers.some(d => d.password === 'password123');
        
        const needsRehydration = state.users.length === 0 || state.drivers.length === 0;
        
        if (!needsPasswordUpdate && !needsRehydration) {
          return;
        }

        const updatedUsers = needsPasswordUpdate 
          ? state.users.map(u => u.password === 'admin' ? { ...u, password: '1234' } : u)
          : state.users;
          
        const updatedDrivers = needsPasswordUpdate
          ? state.drivers.map(d => d.password === 'password123' ? { ...d, password: '1234' } : d)
          : state.drivers;

        set({
          users: updatedUsers,
          drivers: updatedDrivers
        });
      },

      // Notifications
      addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
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
          const rentals = state.rentals.map((r) => (r.id === id ? { ...r, ...updatedRental } : r));
          const updated = rentals.find(r => r.id === id);
          if (updated) get().saveToSupabase('rentals', updated);
          return { rentals };
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
    }),
    {
      name: 'tvde-fleet-data',
    }
  )
);
