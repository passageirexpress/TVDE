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
  ChevronRight,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  minPlan?: 'free' | 'pro' | 'enterprise';
};

type NavGroup = {
  label: string;
  icon?: React.ElementType;
  items: NavItem[];
};



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
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { settings, companies } = useDataStore();

  const userCompany = companies.find(c => c.id === user?.company_id);
  const userPlan = userCompany?.plan || 'free';

  const adminGroups: NavGroup[] = [
    {
      label: t('dashboard'),
      items: [
        { icon: LayoutDashboard, label: t('overview'), path: '/dashboard' },
        { icon: BarChart3, label: t('performance'), path: '/dashboard/performance', minPlan: 'pro' },
        { icon: MapPin, label: t('fleet_map'), path: '/dashboard/fleet-map', minPlan: 'pro' },
      ]
    },
    {
      label: t('operations'),
      items: [
        { icon: Truck, label: t('services'), path: '/dashboard/services', minPlan: 'pro' },
        { icon: Briefcase, label: t('b2b_clients'), path: '/dashboard/clients', minPlan: 'pro' },
        { icon: Car, label: t('rentals'), path: '/dashboard/rentals', minPlan: 'pro' },
        { icon: FileText, label: t('contracts'), path: '/dashboard/contracts', minPlan: 'pro' },
      ]
    },
    {
      label: t('fleet'),
      items: [
        { icon: Car, label: t('vehicles'), path: '/dashboard/vehicles' },
        { icon: AlertTriangle, label: 'Multas', path: '/dashboard/penalties' },
        { icon: Wrench, label: t('maintenance'), path: '/dashboard/maintenance', minPlan: 'pro' },
        { icon: ShieldAlert, label: t('claims'), path: '/dashboard/claims' },
        { icon: Fuel, label: t('fuel_logs'), path: '/dashboard/fuel-logs', minPlan: 'pro' },
      ]
    },
    {
      label: t('team'),
      items: [
        { icon: Users, label: t('drivers'), path: '/dashboard/drivers', minPlan: 'pro' },
        { icon: Trophy, label: 'Ranking', path: '/dashboard/ranking', minPlan: 'pro' },
        { icon: Shield, label: t('users'), path: '/dashboard/users', minPlan: 'pro' },
        { icon: MessageSquare, label: t('team_chat'), path: '/dashboard/chat', minPlan: 'pro' },
      ]
    },
    {
      label: t('financial'),
      items: [
        { icon: Euro, label: t('financial_management'), path: '/dashboard/finance', minPlan: 'enterprise' },
        { icon: FileText, label: t('expenses'), path: '/dashboard/expenses', minPlan: 'pro' },
        { icon: CreditCard, label: t('subscription'), path: '/dashboard/subscription' },
      ]
    },
    {
      label: t('system'),
      items: [
        { icon: BarChart3, label: t('reports'), path: '/dashboard/reports', minPlan: 'enterprise' },
        { icon: History, label: t('audit_logs'), path: '/dashboard/audit-logs', minPlan: 'enterprise' },
        { icon: Settings, label: t('settings'), path: '/dashboard/settings' },
        { icon: UserCircle, label: t('my_profile'), path: '/dashboard/profile' },
        { icon: HelpCircle, label: t('support_faq'), path: '/dashboard/support' },
      ]
    }
  ];

  const masterGroups: NavGroup[] = [
    {
      label: t('master'),
      items: [
        { icon: LayoutDashboard, label: t('master_dashboard'), path: '/dashboard' },
        { icon: Shield, label: t('companies'), path: '/dashboard/companies' },
        { icon: History, label: t('global_audit'), path: '/dashboard/audit-logs' },
        { icon: HelpCircle, label: t('master_support'), path: '/dashboard/support' },
        { icon: Share2, label: t('affiliates'), path: '/dashboard/affiliates' },
        { icon: Users, label: t('all_users'), path: '/dashboard/users' },
        { icon: CreditCard, label: t('master_subscriptions'), path: '/dashboard/subscription' },
        { icon: Settings, label: t('master_settings'), path: '/dashboard/settings' },
      ]
    }
  ];

  const driverGroups: NavGroup[] = [
    {
      label: t('driver'),
      items: [
        { icon: LayoutDashboard, label: t('my_earnings'), path: '/dashboard/driver-panel' },
        { icon: MessageSquare, label: t('support_chat'), path: '/dashboard/chat' },
        { icon: HelpCircle, label: t('help_faq'), path: '/dashboard/support' },
        { icon: ShieldAlert, label: t('report_claim'), path: '/dashboard/claims' },
        { icon: Fuel, label: t('fuel_logs'), path: '/dashboard/fuel-logs' },
        { icon: FileText, label: t('my_expenses'), path: '/dashboard/expenses' },
        { icon: Car, label: t('car_rentals'), path: '/dashboard/rentals' },
        { icon: Car, label: t('my_vehicle'), path: '/dashboard/vehicles' },
        { icon: UserCircle, label: t('my_profile'), path: '/dashboard/profile' },
      ]
    }
  ];

  const planOrder = { 'free': 0, 'pro': 1, 'enterprise': 2 };

  const filterByPlan = (group: NavGroup) => {
    if (user?.role === 'master') return true;
    const filteredItems = group.items.filter(item => {
      if (!item.minPlan) return true;
      return planOrder[userPlan] >= planOrder[item.minPlan];
    });
    return filteredItems.length > 0;
  };

  const getFilteredItems = (group: NavGroup) => {
    if (user?.role === 'master') return group.items;
    return group.items.filter(item => {
      if (!item.minPlan) return true;
      return planOrder[userPlan] >= planOrder[item.minPlan];
    });
  };

  const navGroups = (user?.role === 'master' ? masterGroups : user?.role === 'driver' ? driverGroups : adminGroups)
    .filter(filterByPlan)
    .map(group => ({
      ...group,
      items: getFilteredItems(group)
    }));

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
            <span className="text-sm">{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
