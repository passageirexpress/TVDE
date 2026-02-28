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
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useAuthStore } from '../store/useAuthStore';

const adminItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Motoristas', path: '/drivers' },
  { icon: Car, label: 'Veículos', path: '/vehicles' },
  { icon: Euro, label: 'Financeiro', path: '/finance' },
  { icon: FileText, label: 'Despesas', path: '/expenses' },
  { icon: Car, label: 'Aluguel', path: '/rentals' },
  { icon: FileText, label: 'Relatórios', path: '/reports' },
  { icon: Shield, label: 'Usuários', path: '/users' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
  { icon: UserCircle, label: 'Meu Perfil', path: '/profile' },
];

const driverItems = [
  { icon: LayoutDashboard, label: 'Meus Ganhos', path: '/driver-panel' },
  { icon: FileText, label: 'Minhas Despesas', path: '/expenses' },
  { icon: Car, label: 'Aluguel de Carros', path: '/rentals' },
  { icon: Car, label: 'Meu Veículo', path: '/vehicles' },
  { icon: UserCircle, label: 'Meu Perfil', path: '/profile' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const navItems = user?.role === 'driver' ? driverItems : adminItems;

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
