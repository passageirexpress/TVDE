import { Driver } from '../types';

export const driversData: Driver[] = Array.from({ length: 45 }, (_, i) => ({
  id: `${i + 1}`,
  full_name: i % 2 === 0 ? `João Silva ${i + 1}` : `Maria Santos ${i + 1}`,
  nif: `12345678${i}`,
  iban: `PT50 0000 0000 0000 0000 0000 ${i}`,
  phone: `912 345 67${i}`,
  email: i % 2 === 0 ? `joao${i}@email.com` : `maria${i}@email.com`,
  status: i % 5 === 0 ? 'suspended' : i % 7 === 0 ? 'inactive' : 'active',
  acceptance_rate: 80 + (i % 20),
  cancellation_rate: i % 10,
  rating_uber: 4.5 + (i % 5) / 10,
  rating_bolt: 4.4 + (i % 5) / 10,
  category: i % 3 === 0 ? 'Black' : 'Economy',
  entry_date: '2023-10-12',
  documents: [],
  commission_type: i % 4 === 0 ? 'fixed' : 'variable',
  commission_value: i % 4 === 0 ? 500 : 25
}));
