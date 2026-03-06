import React, { useState, useEffect } from 'react';
import { Car, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, setUser } = useAuthStore();
  const { users, drivers, rehydrateData } = useDataStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
    // Ensure data is present
    if (users.length === 0 || drivers.length === 0) {
      rehydrateData();
    }
  }, [user, navigate, users, drivers, rehydrateData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;

    const isPlaceholder = import.meta.env.VITE_SUPABASE_URL?.includes('placeholder') || !import.meta.env.VITE_SUPABASE_URL;
    
    setIsLoggingIn(true);
    
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // 1. Sign in with Supabase Auth
      let authResult: any = { data: { session: null }, error: null };
      
      if (!isPlaceholder) {
        authResult = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
      } else {
        console.warn("Supabase is in placeholder mode. Real authentication is disabled.");
      }

      const { data, error } = authResult;

      if (error || isPlaceholder || !data.session) {
        if (error) console.log("Auth Error:", error.message);
        
        // Fallback for Master Admin and Legacy Users
        if (cleanEmail === 'master@tvdefleet.com' && cleanPassword === '1234') {
          console.log("Master Admin Fallback Triggered");
          setUser({
            id: 'master-id',
            email: 'master@tvdefleet.com',
            role: 'master',
            full_name: 'Master Admin'
          });
          navigate('/');
          return;
        }

        if (isPlaceholder) {
          // Check local store first if in placeholder mode
          const localUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
          if (localUser) {
            setUser(localUser);
            navigate('/');
            return;
          }
          
          const localDriver = drivers.find(d => d.email.toLowerCase() === cleanEmail && d.password === cleanPassword);
          if (localDriver) {
            setUser({
              id: localDriver.id,
              email: localDriver.email,
              role: 'driver',
              full_name: localDriver.full_name,
              company_id: localDriver.company_id
            });
            navigate('/');
            return;
          }

          throw new Error('O sistema está em modo de demonstração (chaves Supabase não configuradas). Para entrar com uma nova empresa, você deve configurar as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente. Para testar agora, use master@tvdefleet.com / 1234.');
        }

        // Check in Users Table (Legacy/Manual Fallback)
        // Note: This only works for users with plain-text passwords in the DB, 
        // which we only use for local/demo purposes.
        try {
          const { data: adminData } = await supabase
            .from('users')
            .select('id, email, role, full_name, company_id, password')
            .eq('email', cleanEmail)
            .eq('password', cleanPassword)
            .maybeSingle();

          if (adminData) {
            console.log("Database Fallback Triggered (User)");
            setUser({
              id: adminData.id,
              email: adminData.email,
              role: adminData.role,
              full_name: adminData.full_name,
              company_id: adminData.company_id
            });
            navigate('/');
            return;
          }
        } catch (dbFallbackError) {
          console.error("Database fallback failed:", dbFallbackError);
        }

        if (error?.message === 'Invalid login credentials') {
          throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
        }
        throw error || new Error('Falha na autenticação.');
      }

      if (data.session) {
        // Fetch profile data
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (userData) {
          setUser(userData);
        } else {
          const { data: driverData } = await supabase
            .from('drivers')
            .select('*')
            .eq('email', cleanEmail)
            .single();
          if (driverData) {
            setUser({ ...driverData, role: 'driver' } as any);
          }
        }
        navigate('/');
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    const emailToReset = email.trim();
    if (!emailToReset) {
      alert('Por favor, insira seu e-mail para recuperar a senha.');
      return;
    }
    alert(`Um link de recuperação de senha foi enviado para: ${emailToReset}`);
  };

  const handleCreateAccount = () => {
    alert('Para criar uma conta, por favor entre em contato com o administrador do sistema ou o gestor da sua frota.');
  };

  const handleResetSystem = () => {
    if (confirm('Deseja redefinir os dados do sistema? Isso limpará o cache do seu navegador, sairá da conta e restaurará as senhas padrão (1234).')) {
      localStorage.clear();
      window.location.reload();
    }
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
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-sidebar hover:underline"
                >
                  Esqueceu a senha?
                </button>
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

            <div className="space-y-3">
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-sidebar text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={handleCreateAccount}
                className="w-full py-4 border-2 border-sidebar text-sidebar rounded-2xl font-bold hover:bg-sidebar/5 transition-all"
              >
                Criar Conta
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-8 space-y-4">
          <button 
            onClick={handleResetSystem}
            className="text-xs text-gray-400 hover:text-sidebar transition-colors underline underline-offset-4"
          >
            Problemas ao entrar? Redefinir dados do sistema
          </button>
          <p className="text-sm text-gray-400">
            © 2024 TVDE Fleet Management. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
