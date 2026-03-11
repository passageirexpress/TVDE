import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { Trip, Vehicle } from '../types';
import { MapPin, Navigation, Clock, CreditCard, Star, Search, Car, Package, ChevronRight, History, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const PassengerApp: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { vehicles, drivers, addTrip, trips } = useDataStore();
  const [activeTab, setActiveTab] = useState<'request' | 'history' | 'profile'>('request');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Economy' | 'Black' | 'Delivery'>('Economy');

  const myTrips = trips.filter(t => t.passenger_id === user?.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  useEffect(() => {
    if (pickup && destination) {
      // Mock price calculation
      const base = selectedCategory === 'Black' ? 8 : selectedCategory === 'Delivery' ? 10 : 5;
      setEstimatedPrice(base + Math.random() * 15);
    } else {
      setEstimatedPrice(null);
    }
  }, [pickup, destination, selectedCategory]);

  const handleRequestTrip = async () => {
    if (!pickup || !destination) {
      toast.error('Por favor, defina a recolha e o destino');
      return;
    }

    setIsRequesting(true);
    
    // Simulate finding a driver
    await new Promise(resolve => setTimeout(resolve, 2000));

    const availableVehicles = vehicles.filter(v => v.status === 'active' && (selectedCategory === 'Delivery' ? true : v.category === selectedCategory));
    if (availableVehicles.length === 0) {
      toast.error('Não há motoristas disponíveis nesta categoria no momento.');
      setIsRequesting(false);
      return;
    }

    const vehicle = availableVehicles[Math.floor(Math.random() * availableVehicles.length)];
    const driver = drivers.find(d => d.id === vehicle.current_driver_id);

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      passenger_id: user?.id || 'guest',
      driver_id: driver?.id || '1',
      vehicle_id: vehicle.id,
      origin_lat: 38.7223,
      origin_lng: -9.1393,
      dest_lat: 38.7369,
      dest_lng: -9.1427,
      origin_address: pickup,
      dest_address: destination,
      status: 'requested',
      estimated_price: estimatedPrice || 0,
      is_delivery: selectedCategory === 'Delivery',
      delivery_type: selectedCategory === 'Delivery' ? 'light' : undefined,
      created_at: new Date().toISOString()
    };

    addTrip(newTrip);
    toast.success('Viagem solicitada! Motorista a caminho.');
    setIsRequesting(false);
    setPickup('');
    setDestination('');
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.full_name?.charAt(0) || 'P'}
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Olá, {user?.full_name?.split(' ')[0] || 'Passageiro'}</h1>
            <p className="text-xs text-gray-500">Onde vamos hoje?</p>
          </div>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-red-600">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {activeTab === 'request' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Map Placeholder */}
            <div className="h-48 bg-indigo-50 rounded-2xl relative overflow-hidden border border-indigo-100 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i14!2i8145!3i6141!2m3!1e0!2sm!3i6141!3m8!2spt-PT!3sPT!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1f2!23i1301875')] bg-cover"></div>
              <div className="relative z-10 flex flex-col items-center">
                <MapPin className="text-indigo-600 mb-2" size={32} />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Mapa em Tempo Real</span>
              </div>
            </div>

            {/* Search Box */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <input
                  type="text"
                  placeholder="Local de recolha"
                  className="bg-transparent w-full text-sm font-medium focus:outline-none"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <input
                  type="text"
                  placeholder="Para onde?"
                  className="bg-transparent w-full text-sm font-medium focus:outline-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedCategory('Economy')}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  selectedCategory === 'Economy' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'
                }`}
              >
                <Car size={24} className={selectedCategory === 'Economy' ? 'text-indigo-600' : 'text-gray-400'} />
                <span className={`text-[10px] font-bold uppercase ${selectedCategory === 'Economy' ? 'text-indigo-600' : 'text-gray-500'}`}>Economy</span>
              </button>
              <button
                onClick={() => setSelectedCategory('Black')}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  selectedCategory === 'Black' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'
                }`}
              >
                <Car size={24} className={selectedCategory === 'Black' ? 'text-indigo-600' : 'text-gray-400'} />
                <span className={`text-[10px] font-bold uppercase ${selectedCategory === 'Black' ? 'text-indigo-600' : 'text-gray-500'}`}>Black</span>
              </button>
              <button
                onClick={() => setSelectedCategory('Delivery')}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                  selectedCategory === 'Delivery' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'
                }`}
              >
                <Package size={24} className={selectedCategory === 'Delivery' ? 'text-indigo-600' : 'text-gray-400'} />
                <span className={`text-[10px] font-bold uppercase ${selectedCategory === 'Delivery' ? 'text-indigo-600' : 'text-gray-500'}`}>Delivery</span>
              </button>
            </div>

            {/* Price & Request */}
            {estimatedPrice && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Preço Estimado</p>
                    <h2 className="text-3xl font-black text-gray-900">
                      {estimatedPrice.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tempo de Espera</p>
                    <p className="text-sm font-bold text-indigo-600">~ 4 min</p>
                  </div>
                </div>
                <button
                  onClick={handleRequestTrip}
                  disabled={isRequesting}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                >
                  {isRequesting ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Solicitar {selectedCategory}</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Minhas Viagens</h2>
            {myTrips.length > 0 ? (
              myTrips.map(trip => (
                <div key={trip.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {trip.is_delivery ? <Package size={16} /> : <Car size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(trip.created_at).toLocaleDateString('pt-PT')}
                        </p>
                        <p className="text-sm font-bold text-gray-900">{trip.is_delivery ? 'Entrega' : 'Viagem'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-indigo-600">
                      {trip.estimated_price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="space-y-2 border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      <span className="truncate">{trip.origin_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                      <span className="truncate">{trip.dest_address}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <History className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">Ainda não realizou nenhuma viagem.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <User size={48} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-6 flex gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{myTrips.length}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Viagens</p>
                </div>
                <div className="w-px h-10 bg-gray-100"></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">4.9</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Rating</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">Pagamentos</span>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Star size={20} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">Favoritos</span>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('request')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'request' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <Navigation size={24} />
          <span className="text-[10px] font-bold uppercase">Pedir</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase">Atividade</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default PassengerApp;
