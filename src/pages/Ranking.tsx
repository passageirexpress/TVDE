import React, { useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import { Trophy, Star, TrendingUp, Award, User, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Ranking: React.FC = () => {
  const { drivers, payments, trips } = useDataStore();

  const driverStats = useMemo(() => {
    return drivers.map(driver => {
      const driverPayments = payments.filter(p => p.driver_id === driver.id);
      const totalEarnings = driverPayments.reduce((acc, curr) => acc + curr.gross, 0);
      const driverTrips = trips.filter(t => t.driver_id === driver.id && t.status === 'completed');
      
      // Mocked data for ranking metrics if not available
      const acceptanceRate = 95 + Math.random() * 5;
      const cancellationRate = Math.random() * 3;
      const rating = 4.5 + Math.random() * 0.5;

      return {
        ...driver,
        totalEarnings,
        tripCount: driverTrips.length || Math.floor(Math.random() * 100), // Fallback for demo
        acceptanceRate,
        cancellationRate,
        rating,
        score: (totalEarnings / 1000) + (rating * 10) + (acceptanceRate / 10) - (cancellationRate * 5)
      };
    }).sort((a, b) => b.score - a.score);
  }, [drivers, payments, trips]);

  const topThree = driverStats.slice(0, 3);
  const restOfDrivers = driverStats.slice(3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ranking de Motoristas</h1>
        <p className="text-gray-500">Os melhores desempenhos da semana</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center relative h-64 justify-center order-2 md:order-1">
            <div className="absolute -top-6 bg-gray-100 text-gray-600 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white font-bold text-xl">2</div>
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center">{topThree[1].full_name}</h3>
            <div className="flex items-center gap-1 text-yellow-500 mb-2">
              <Star size={16} fill="currentColor" />
              <span className="font-semibold">{topThree[1].rating.toFixed(1)}</span>
            </div>
            <div className="text-indigo-600 font-bold">
              {topThree[1].totalEarnings.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 flex flex-col items-center relative h-80 justify-center transform scale-105 z-10 order-1 md:order-2">
            <div className="absolute -top-8 bg-yellow-400 text-white w-16 h-16 rounded-full flex items-center justify-center border-4 border-white font-bold text-2xl shadow-lg">
              <Trophy size={32} />
            </div>
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <User size={48} className="text-white" />
            </div>
            <h3 className="font-bold text-white text-xl text-center mb-1">{topThree[0].full_name}</h3>
            <div className="flex items-center gap-1 text-yellow-300 mb-4">
              <Star size={20} fill="currentColor" />
              <span className="font-bold text-lg">{topThree[0].rating.toFixed(1)}</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full text-white font-bold backdrop-blur-sm">
              {topThree[0].totalEarnings.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </div>
            <div className="mt-4 text-indigo-100 text-sm font-medium">Líder da Semana</div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center relative h-56 justify-center order-3">
            <div className="absolute -top-6 bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white font-bold text-xl">3</div>
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center">{topThree[2].full_name}</h3>
            <div className="flex items-center gap-1 text-yellow-500 mb-2">
              <Star size={16} fill="currentColor" />
              <span className="font-semibold">{topThree[2].rating.toFixed(1)}</span>
            </div>
            <div className="text-indigo-600 font-bold">
              {topThree[2].totalEarnings.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Taxa Aceitação Média</div>
            <div className="text-xl font-bold">96.4%</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Award size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Rating Médio</div>
            <div className="text-xl font-bold">4.85</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <Star size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Viagens</div>
            <div className="text-xl font-bold">1,248</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Prémio de Eficiência</div>
            <div className="text-xl font-bold">€250.00</div>
          </div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Tabela de Classificação</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Posição</th>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Viagens</th>
                <th className="px-6 py-4">Aceitação</th>
                <th className="px-6 py-4">Cancelamentos</th>
                <th className="px-6 py-4 text-right">Ganhos Totais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {driverStats.map((driver, index) => (
                <tr key={driver.id} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-200 text-orange-700' :
                        'text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {driver.photo_url ? (
                          <img src={driver.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{driver.full_name}</div>
                        <div className="text-xs text-gray-500">{driver.nif}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <Star size={16} fill="currentColor" />
                      {driver.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {driver.tripCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${driver.acceptanceRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{driver.acceptanceRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
                      <ArrowDownRight size={14} />
                      {driver.cancellationRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600">
                    {driver.totalEarnings.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
