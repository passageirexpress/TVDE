import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, User, Search, Menu, X, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Layout() {
  const user = useAuthStore(state => state.user);
  const { notifications, markNotificationsAsRead } = useDataStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-full w-64 lg:w-96">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-sm">Notificações</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).length > 0 ? (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={cn(
                          "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-default",
                          !n.read && "bg-blue-50/30"
                        )}>
                          <div className="flex gap-3">
                            <div className={cn(
                              "p-2 rounded-lg h-fit",
                              n.title.includes('Pagamento') ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                            )}>
                              {n.title.includes('Pagamento') ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{n.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed truncate w-48">{n.message}</p>
                              <p className="text-[9px] text-gray-400 mt-2 font-medium">{n.date}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-sm text-gray-400 italic">Nenhuma notificação.</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/notifications');
                      }}
                      className="text-[10px] font-bold text-sidebar uppercase tracking-widest hover:underline"
                    >
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/profile" className="flex items-center gap-3 pl-3 lg:pl-6 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">{user?.full_name || 'Usuário'}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {user?.role === 'admin' ? 'Administrador' : user?.role === 'driver' ? 'Motorista' : 'Gestor'}
                </p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
              </div>
            </Link>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
