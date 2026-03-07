import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Euro, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Shield,
  UserCircle,
  BarChart3,
  X,
  CreditCard,
  Wrench,
  ShieldAlert,
  MessageSquare,
  Truck,
  Package,
  MapPin,
  Users as UsersIcon,
  Briefcase,
  Share2,
  Fuel
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useAuthStore } from '../store/useAuthStore';

const adminItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BarChart3, label: 'Desempenho', path: '/dashboard/performance' },
  { icon: Truck, label: 'Serviços', path: '/dashboard/services' },
  { icon: Briefcase, label: 'Clientes B2B', path: '/dashboard/clients' },
  { icon: MapPin, label: 'Mapa da Frota', path: '/dashboard/fleet-map' },
  { icon: Car, label: 'Frota', path: '/dashboard/fleet' },
  { icon: Users, label: 'Motoristas', path: '/dashboard/drivers' },
  { icon: FileText, label: 'Contratos', path: '/dashboard/contracts' },
  { icon: Car, label: 'Veículos', path: '/dashboard/vehicles' },
  { icon: Wrench, label: 'Manutenção', path: '/dashboard/maintenance' },
  { icon: ShieldAlert, label: 'Sinistros', path: '/dashboard/claims' },
  { icon: MessageSquare, label: 'Chat Equipa', path: '/dashboard/chat' },
  { icon: Euro, label: 'Financeiro', path: '/dashboard/finance' },
  { icon: FileText, label: 'Despesas', path: '/dashboard/expenses' },
  { icon: Fuel, label: 'Abastecimentos', path: '/dashboard/fuel-logs' },
  { icon: Car, label: 'Aluguel', path: '/dashboard/rentals' },
  { icon: FileText, label: 'Relatórios', path: '/dashboard/reports' },
  { icon: Shield, label: 'Usuários', path: '/dashboard/users' },
  { icon: CreditCard, label: 'Assinatura', path: '/dashboard/subscription' },
  { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
  { icon: UserCircle, label: 'Meu Perfil', path: '/dashboard/profile' },
];

const masterItems = [
  { icon: LayoutDashboard, label: 'Dashboard Master', path: '/dashboard' },
  { icon: Shield, label: 'Empresas', path: '/dashboard/companies' },
  { icon: Share2, label: 'Afiliados', path: '/dashboard/affiliates' },
  { icon: Users, label: 'Todos Usuários', path: '/dashboard/users' },
  { icon: CreditCard, label: 'Assinaturas Master', path: '/dashboard/subscription' },
  { icon: Settings, label: 'Configurações Master', path: '/dashboard/settings' },
];

const driverItems = [
  { icon: LayoutDashboard, label: 'Meus Ganhos', path: '/dashboard/driver-panel' },
  { icon: MessageSquare, label: 'Chat Suporte', path: '/dashboard/chat' },
  { icon: ShieldAlert, label: 'Reportar Sinistro', path: '/dashboard/claims' },
  { icon: Fuel, label: 'Abastecimentos', path: '/dashboard/fuel-logs' },
  { icon: FileText, label: 'Minhas Despesas', path: '/dashboard/expenses' },
  { icon: Car, label: 'Aluguel de Carros', path: '/dashboard/rentals' },
  { icon: Car, label: 'Meu Veículo', path: '/dashboard/vehicles' },
  { icon: UserCircle, label: 'Meu Perfil', path: '/dashboard/profile' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const navItems = user?.role === 'master' ? masterItems : user?.role === 'driver' ? driverItems : adminItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 bg-sidebar h-screen flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-sidebar" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TVDE Fleet</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-white text-sidebar font-medium shadow-lg shadow-black/20" 
                  : "text-sidebar-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sidebar-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
