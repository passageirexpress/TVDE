import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Fuel,
  History,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

type NavGroup = {
  label: string;
  icon?: React.ElementType;
  items: NavItem[];
};

const adminGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
      { icon: BarChart3, label: 'Desempenho', path: '/dashboard/performance' },
      { icon: MapPin, label: 'Mapa da Frota', path: '/dashboard/fleet-map' },
    ]
  },
  {
    label: 'Operações',
    items: [
      { icon: Truck, label: 'Serviços', path: '/dashboard/services' },
      { icon: Briefcase, label: 'Clientes B2B', path: '/dashboard/clients' },
      { icon: Car, label: 'Aluguel', path: '/dashboard/rentals' },
      { icon: FileText, label: 'Contratos', path: '/dashboard/contracts' },
    ]
  },
  {
    label: 'Frota',
    items: [
      { icon: Car, label: 'Veículos', path: '/dashboard/vehicles' },
      { icon: Wrench, label: 'Manutenção', path: '/dashboard/maintenance' },
      { icon: ShieldAlert, label: 'Sinistros', path: '/dashboard/claims' },
      { icon: Fuel, label: 'Abastecimentos', path: '/dashboard/fuel-logs' },
    ]
  },
  {
    label: 'Equipa',
    items: [
      { icon: Users, label: 'Motoristas', path: '/dashboard/drivers' },
      { icon: Shield, label: 'Usuários', path: '/dashboard/users' },
      { icon: MessageSquare, label: 'Chat Equipa', path: '/dashboard/chat' },
    ]
  },
  {
    label: 'Financeiro',
    items: [
      { icon: Euro, label: 'Gestão Financeira', path: '/dashboard/finance' },
      { icon: FileText, label: 'Despesas', path: '/dashboard/expenses' },
      { icon: CreditCard, label: 'Assinatura', path: '/dashboard/subscription' },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
      { icon: History, label: 'Auditoria', path: '/dashboard/audit-logs' },
      { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
      { icon: UserCircle, label: 'Meu Perfil', path: '/dashboard/profile' },
      { icon: HelpCircle, label: 'Suporte & FAQ', path: '/dashboard/support' },
    ]
  }
];

const masterGroups: NavGroup[] = [
  {
    label: 'Master',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard Master', path: '/dashboard' },
      { icon: Shield, label: 'Empresas', path: '/dashboard/companies' },
      { icon: History, label: 'Auditoria Global', path: '/dashboard/audit-logs' },
      { icon: HelpCircle, label: 'Suporte Master', path: '/dashboard/support' },
      { icon: Share2, label: 'Afiliados', path: '/dashboard/affiliates' },
      { icon: Users, label: 'Todos Usuários', path: '/dashboard/users' },
      { icon: CreditCard, label: 'Assinaturas Master', path: '/dashboard/subscription' },
      { icon: Settings, label: 'Configurações Master', path: '/dashboard/settings' },
    ]
  }
];

const driverGroups: NavGroup[] = [
  {
    label: 'Motorista',
    items: [
      { icon: LayoutDashboard, label: 'Meus Ganhos', path: '/dashboard/driver-panel' },
      { icon: MessageSquare, label: 'Chat Suporte', path: '/dashboard/chat' },
      { icon: HelpCircle, label: 'Ajuda & FAQ', path: '/dashboard/support' },
      { icon: ShieldAlert, label: 'Reportar Sinistro', path: '/dashboard/claims' },
      { icon: Fuel, label: 'Abastecimentos', path: '/dashboard/fuel-logs' },
      { icon: FileText, label: 'Minhas Despesas', path: '/dashboard/expenses' },
      { icon: Car, label: 'Aluguel de Carros', path: '/dashboard/rentals' },
      { icon: Car, label: 'Meu Veículo', path: '/dashboard/vehicles' },
      { icon: UserCircle, label: 'Meu Perfil', path: '/dashboard/profile' },
    ]
  }
];

function SidebarGroup({ group, onClose }: { group: NavGroup, onClose: () => void }) {
  const location = useLocation();
  const isActiveGroup = group.items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          {group.icon && <group.icon className="w-4 h-4" />}
          <span>{group.label}</span>
        </div>
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      
      {isOpen && (
        <div className="mt-1 space-y-1">
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-white text-sidebar font-medium shadow-lg shadow-black/20" 
                  : "text-sidebar-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { settings } = useDataStore();

  const navGroups = user?.role === 'master' ? masterGroups : user?.role === 'driver' ? driverGroups : adminGroups;

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
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-sidebar" />
              </div>
            )}
            <span className="text-white font-bold text-lg tracking-tight">{settings?.name || 'TVDE Fleet'}</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 mt-2 overflow-y-auto custom-scrollbar pb-20">
          {navGroups.map((group, index) => (
            <SidebarGroup key={index} group={group} onClose={onClose} />
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-sidebar absolute bottom-0 w-full">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sidebar-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
