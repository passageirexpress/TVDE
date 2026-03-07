import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Car, 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Search,
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom vehicle icon
const createVehicleIcon = (status: string) => {
  const color = status === 'active' ? '#10b981' : status === 'maintenance' ? '#f59e0b' : '#6b7280';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; items-center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export default function FleetMap() {
  const { vehicles, drivers } = useDataStore();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulate positions around Lisbon
  const [vehiclePositions, setVehiclePositions] = useState<any[]>([]);

  useEffect(() => {
    const positions = vehicles.map((v, idx) => ({
      ...v,
      // Random positions around Lisbon center [38.7223, -9.1393]
      lat: 38.7223 + (Math.random() - 0.5) * 0.1,
      lng: -9.1393 + (Math.random() - 0.5) * 0.1,
      driver: drivers.find(d => d.id === v.current_driver_id)
    }));
    setVehiclePositions(positions);

    // Simulate movement every 10 seconds
    const interval = setInterval(() => {
      setVehiclePositions(prev => prev.map(p => ({
        ...p,
        lat: p.lat + (Math.random() - 0.5) * 0.001,
        lng: p.lng + (Math.random() - 0.5) * 0.001,
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, [vehicles, drivers]);

  const filteredVehicles = vehiclePositions.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={cn(
      "flex flex-col gap-6 transition-all duration-500",
      isFullscreen ? "fixed inset-0 z-[100] bg-[#F5F5F5] p-6" : "h-[calc(100vh-120px)]"
    )}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Monitorização em Tempo Real</h1>
          <p className="text-gray-500 text-sm">Acompanhe a localização e status de toda a sua frota no mapa.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400 hover:text-sidebar transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Sidebar List */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Procurar matrícula..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-sidebar/10 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['all', 'active', 'maintenance', 'inactive'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    filterStatus === s ? "bg-sidebar text-white" : "bg-gray-50 text-gray-400 hover:text-gray-600"
                  )}
                >
                  {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'maintenance' ? 'Oficina' : 'Inativos'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredVehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={cn(
                  "w-full p-4 rounded-[24px] border transition-all text-left group",
                  selectedVehicle?.id === v.id 
                    ? "bg-sidebar text-white border-sidebar shadow-lg shadow-sidebar/20" 
                    : "bg-white border-gray-100 hover:border-sidebar/30 shadow-sm"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tighter",
                    selectedVehicle?.id === v.id ? "text-white/60" : "text-gray-400"
                  )}>
                    {v.brand} {v.model}
                  </span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    v.status === 'active' ? "bg-emerald-500" : v.status === 'maintenance' ? "bg-amber-500" : "bg-gray-400"
                  )} />
                </div>
                <p className="text-lg font-black tracking-tighter mb-1">{v.plate}</p>
                <div className="flex items-center gap-2">
                  <User className={cn("w-3 h-3", selectedVehicle?.id === v.id ? "text-white/60" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold", selectedVehicle?.id === v.id ? "text-white/80" : "text-gray-600")}>
                    {v.driver?.full_name || 'Sem motorista'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative">
          <MapContainer 
            center={[38.7223, -9.1393]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredVehicles.map((v) => (
              <Marker 
                key={v.id} 
                position={[v.lat, v.lng]} 
                icon={createVehicleIcon(v.status)}
                eventHandlers={{
                  click: () => setSelectedVehicle(v),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[150px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{v.brand} {v.model}</p>
                    <p className="text-lg font-black tracking-tighter text-gray-900 mb-2">{v.plate}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <User className="w-3 h-3" />
                      {v.driver?.full_name || 'Sem motorista'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapUpdater center={selectedVehicle ? [selectedVehicle.lat, selectedVehicle.lng] : null} />
          </MapContainer>

          {/* Floating Info Card */}
          {selectedVehicle && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 z-[1000] animate-in slide-in-from-bottom-4">
              <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black tracking-tighter text-gray-900">{selectedVehicle.plate}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase">{selectedVehicle.brand} {selectedVehicle.model}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedVehicle(null)}
                    className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-600"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Última Ativ.</span>
                    </div>
                    <p className="text-xs font-black">Há 2 min</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Navigation className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Velocidade</span>
                    </div>
                    <p className="text-xs font-black">42 km/h</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-sidebar/5 rounded-2xl">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <User className="w-5 h-5 text-sidebar" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Motorista Atual</p>
                      <p className="text-sm font-bold text-gray-900">{selectedVehicle.driver?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-sidebar text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-sidebar/20">
                    Ver Histórico Completo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}
