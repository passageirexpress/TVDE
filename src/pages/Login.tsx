import React, { useState, useEffect } from 'react';
import { Car, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, setUser } = useAuthStore();
  const { users, drivers } = useDataStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check in Users (Admins/Managers)
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser({
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        full_name: foundUser.full_name
      });
      navigate('/');
      return;
    }

    // Check in Drivers
    const foundDriver = drivers.find(d => d.email === email && d.password === password);
    if (foundDriver) {
      setUser({
        id: foundDriver.id,
        email: foundDriver.email,
        role: 'driver',
        full_name: foundDriver.full_name
      });
      navigate('/');
      return;
    }

    alert('Credenciais inválidas. Por favor, tente novamente.');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-sidebar rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sidebar/20">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">TVDE Fleet CRM</h1>
          <p className="text-gray-500 mt-2">Entre com suas credenciais para gerir sua frota.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sidebar/10 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700">Senha</label>
                <a href="#" className="text-xs font-bold text-sidebar hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sidebar/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-sidebar text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20 group"
            >
              Entrar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          © 2024 TVDE Fleet Management. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
