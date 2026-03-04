import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(value / 100);
}

export function getUberPeriod(date: Date = new Date(), offsetWeeks: number = -1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Current week's Monday
  const monday = new Date(d.setDate(diff));
  
  // Apply week offset
  monday.setDate(monday.getDate() + (offsetWeeks * 7));
  
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };
  
  return `${formatDate(monday)} - ${formatDate(nextMonday)}`;
}

export function isValidNIF(nif: string): boolean {
  const nifStr = nif.replace(/\D/g, '');
  if (nifStr.length !== 9) return false;

  const firstDigit = parseInt(nifStr.charAt(0));
  if (![1, 2, 3, 5, 6, 8, 9].includes(firstDigit)) return false;

  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(nifStr.charAt(i)) * (9 - i);
  }

  const expectedCheckDigit = 11 - (sum % 11);
  const checkDigit = expectedCheckDigit >= 10 ? 0 : expectedCheckDigit;

  return checkDigit === parseInt(nifStr.charAt(8));
}
