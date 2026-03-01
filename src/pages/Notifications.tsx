import React from 'react';
import { Bell, CheckCircle2, Clock, Trash2, CheckSquare } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { cn } from '../lib/utils';

export default function Notifications() {
  const { notifications, markNotificationsAsRead } = useDataStore();

  const handleMarkAllAsRead = () => {
    markNotificationsAsRead();
    alert('Todas as notificações foram marcadas como lidas.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-gray-500 mt-1">Gerencie seus alertas e mensagens do sistema.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <CheckSquare className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-6 sm:p-8 transition-all hover:bg-gray-50/50 flex gap-4 sm:gap-6",
                  !n.read && "bg-blue-50/20 border-l-4 border-l-sidebar"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl h-fit shrink-0",
                  n.title.includes('Pagamento') ? "bg-emerald-100 text-emerald-600" : 
                  n.title.includes('Vencimento') ? "bg-amber-100 text-amber-600" :
                  "bg-blue-100 text-blue-600"
                )}>
                  {n.title.includes('Pagamento') ? <CheckCircle2 className="w-6 h-6" /> : 
                   n.title.includes('Vencimento') ? <Bell className="w-6 h-6" /> :
                   <Clock className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-lg truncate">{n.title}</h4>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {n.date}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed max-w-3xl">{n.message}</p>
                  {!n.read && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-sidebar rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-bold text-sidebar uppercase tracking-widest">Nova</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sem notificações</h3>
              <p className="text-gray-500 mt-2">Você está em dia com todos os alertas do sistema.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
