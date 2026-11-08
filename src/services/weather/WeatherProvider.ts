import type { WeatherData } from '../../types/weather.ts';

export interface WeatherProvider {
  getWeather(lat: number, lon: number): Promise<WeatherData>;
  getProviderName(): string;
}
