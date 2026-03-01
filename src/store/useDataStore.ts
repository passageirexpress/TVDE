import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Driver, Vehicle, Expense, Rental, User, CompanySettings, AppNotification } from '../types';
import { driversData } from '../data/mockData';

interface DataState {
  drivers: Driver[];
  vehicles: Vehicle[];
  expenses: Expense[];
  rentals: Rental[];
  users: User[];
  payments: any[];
  notifications: AppNotification[];
  settings: CompanySettings;
  
  // Notifications
  addNotification: (notification: AppNotification) => void;
  markNotificationsAsRead: () => void;
  
  // Payments
  setPayments: (payments: any[]) => void;
  addPayment: (payment: any) => void;
  updatePayment: (id: string, updatedPayment: any) => void;
  
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
  resetEarnings: () => void;
  clearAllData: () => void;
  approveRental: (rentalId: string, driverId: string, driverName: string) => void;
  rejectRental: (rentalId: string, driverName: string) => void;
}

const initialVehicles: Vehicle[] = [
  { 
    id: '1', 
    brand: 'Toyota', 
    model: 'Corolla', 
    year: 2022, 
    plate: 'AA-11-BB', 
    category: 'Economy', 
    status: 'active', 
    entry_date: '2023-01-01', 
    insurance_expiry: '2024-12-31', 
    inspection_expiry: '2024-12-31', 
    policy_number: '123',
    current_driver_id: '1',
    documents: [] 
  },
  { 
    id: '2', 
    brand: 'Mercedes', 
    model: 'E-Class', 
    year: 2023, 
    plate: 'CC-22-DD', 
    category: 'Black', 
    status: 'active', 
    entry_date: '2023-01-01', 
    insurance_expiry: '2024-03-15', 
    inspection_expiry: '2024-03-20', 
    policy_number: '124',
    current_driver_id: '2',
    documents: [] 
  },
  { 
    id: '3', 
    brand: 'Tesla', 
    model: 'Model 3', 
    year: 2023, 
    plate: 'EE-33-FF', 
    category: 'Black', 
    status: 'maintenance', 
    entry_date: '2023-01-01', 
    insurance_expiry: '2024-12-31', 
    inspection_expiry: '2024-12-31', 
    policy_number: '125',
    documents: [] 
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
    password: 'admin',
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
  bolt_client_secret: ''
};

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      drivers: driversData,
      vehicles: initialVehicles,
      expenses: initialExpenses,
      rentals: initialRentals,
      users: initialUsers,
      payments: [
        { id: '1', driver: 'João Silva', period: '16/02 - 23/02', gross: 600, net: 450, status: 'paid', date: '2026-02-23' },
        { id: '2', driver: 'Maria Santos', period: '16/02 - 23/02', gross: 750, net: 562.5, status: 'paid', date: '2026-02-23' },
        { id: '3', driver: 'Ana Oliveira', period: '23/02 - 02/03', gross: 400, net: 300, status: 'pending', date: '2026-03-02' },
        { id: '4', driver: 'Pedro Costa', period: '23/02 - 02/03', gross: 225, net: 168.75, status: 'pending', date: '2026-03-02' },
      ],
      notifications: [
        { id: '1', title: 'Bem-vindo ao TVDE Fleet', message: 'O seu sistema de gestão de frota está pronto a usar.', date: '2026-02-26', read: false },
        { id: '2', title: 'Pagamento Processado', message: 'O pagamento da semana 16/02 foi concluído com sucesso.', date: '2026-02-23', read: true },
      ],
      settings: initialSettings,

      // Notifications
      addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
      markNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      // Payments
      setPayments: (payments) => set({ payments }),
      addPayment: (payment) => set((state) => ({ payments: [payment, ...state.payments] })),
      updatePayment: (id, updatedPayment) => set((state) => ({
        payments: state.payments.map((p) => (p.id === id ? { ...p, ...updatedPayment } : p)),
      })),

      // Drivers
      setDrivers: (drivers) => set({ drivers }),
      addDriver: (driver) => set((state) => ({ drivers: [driver, ...state.drivers] })),
      updateDriver: (id, updatedDriver) => set((state) => ({
        drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...updatedDriver } : d)),
      })),

      // Vehicles
      setVehicles: (vehicles) => set({ vehicles }),
      addVehicle: (vehicle) => set((state) => ({ vehicles: [vehicle, ...state.vehicles] })),
      updateVehicle: (id, updatedVehicle) => set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updatedVehicle } : v)),
      })),

      // Expenses
      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
      updateExpense: (id, updatedExpense) => set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updatedExpense } : e)),
      })),

      // Rentals
      setRentals: (rentals) => set({ rentals }),
      addRental: (rental) => set((state) => ({ rentals: [rental, ...state.rentals] })),
      updateRental: (id, updatedRental) => set((state) => ({
        rentals: state.rentals.map((r) => (r.id === id ? { ...r, ...updatedRental } : r)),
      })),

      // Users
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [user, ...state.users] })),
      updateUser: (id, updatedUser) => set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
      })),

      // Settings
      updateSettings: (updatedSettings) => set((state) => ({
        settings: { ...state.settings, ...updatedSettings },
      })),

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
          id: Math.random().toString(36).substr(2, 9),
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
