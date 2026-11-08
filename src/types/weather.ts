export type FreshnessState = 'LIVE' | 'RECENT' | 'CACHED' | 'STALE' | 'SIMULATED';

export interface WeatherForecast {
  dayOffset: number;
  temperature: number;
  humidity: number;
  rainfallProbability: number;
  condition: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfallProbability: number;
  condition: string;
  forecast: WeatherForecast[];
  freshness: FreshnessState;
  lastUpdated: string;
  source: string;
}

export const WEATHER_TYPES_DEFINED = true;
export default {};
