import { Transfer } from '../types';

/**
 * Aviationstack API Service (Free Tier)
 * You can get a free API key at: https://aviationstack.com/
 */

export interface FlightInfo {
  status: 'on_time' | 'delayed' | 'landed' | 'unknown';
  estimated_arrival?: string;
  actual_arrival?: string;
  departure_airport?: string;
}

export const fetchFlightStatus = async (flightNumber: string): Promise<FlightInfo> => {
  try {
    const response = await fetch(`/api/flights/status?flightNumber=${flightNumber}`);
    if (!response.ok) throw new Error('Failed to fetch flight status');
    return await response.json();
  } catch (error) {
    console.error('Error fetching flight status:', error);
    return { status: 'unknown' };
  }
};
