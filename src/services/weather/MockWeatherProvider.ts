import type { WeatherProvider } from './WeatherProvider.ts';
import type { WeatherData } from '../../types/weather.ts';

/**
 * Mock provider for SIH Demo/Offline capability. 
 * Generates deterministic weather based on coordinates to mimic a real API.
 */
export class MockWeatherProvider implements WeatherProvider {
  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Deterministic mock generation based on location
    const baseTemp = 25 + (Math.abs(lat) % 10);
    const isRainy = (Math.abs(lon) % 2) > 1;
    
    const forecasts = Array.from({ length: 5 }).map((_, i) => {
      const dayRainRisk = isRainy ? 60 + (i * 5) : 10 + (i * 2);
      return {
        dayOffset: i + 1,
        temperature: baseTemp + (Math.sin(i) * 3),
        humidity: 60 + (Math.cos(i) * 10),
        rainfallProbability: Math.min(100, Math.max(0, dayRainRisk)),
        condition: dayRainRisk > 50 ? 'Rainy' : 'Cloudy'
      };
    });

    return {
      temperature: baseTemp,
      humidity: 65,
      rainfallProbability: isRainy ? 75 : 15,
      condition: isRainy ? 'Scattered Showers' : 'Partly Cloudy',
      forecast: forecasts,
      freshness: 'SIMULATED',
      lastUpdated: new Date().toISOString(),
      source: 'Agro Vanguard Predictive Weather Engine'
    };
  }

  getProviderName(): string {
    return 'MockWeatherProvider';
  }
}
