import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, User, Search, Menu, X, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Layout() {
  const user = useAuthStore(state => state.user);
  const { notifications, markNotificationsAsRead } = useDataStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

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
                  if (!showNotifications) markNotificationsAsRead();
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
                    {notifications.length > 0 ? (
                      notifications.map(n => (
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
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
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
                        setShowAllNotifications(true);
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
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Todas as Notificações</h2>
                <p className="text-sm text-gray-500 mt-1">Histórico completo de alertas e mensagens.</p>
              </div>
              <button onClick={() => setShowAllNotifications(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                    <div className={cn(
                      "p-3 rounded-xl h-fit",
                      n.title.includes('Pagamento') ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {n.title.includes('Pagamento') ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900">{n.title}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{n.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-400 italic">Nenhuma notificação encontrada.</p>
                </div>
              )}
            </div>
            <div className="p-8 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowAllNotifications(false)}
                className="px-8 py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-sidebar/20"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
