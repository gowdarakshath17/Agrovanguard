import type { WeatherData } from '../../types/weather.ts';
import type { WeatherProvider } from './WeatherProvider.ts';

export class OpenMeteoProvider implements WeatherProvider {
  getProviderName(): string {
    return 'Open-Meteo';
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenMeteo API failed with status ${response.status}`);
    }
    const data = await response.json();

    const current = data.current;
    const daily = data.daily;

    const forecast = daily.time.slice(1, 6).map((time: string, index: number) => ({
      dayOffset: index + 1,
      temperature: (daily.temperature_2m_max[index + 1] + daily.temperature_2m_min[index + 1]) / 2,
      rainfallProbability: daily.precipitation_probability_max[index + 1] || 0,
    }));

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      rainfallProbability: daily.precipitation_probability_max[0] || 0,
      condition: this.getConditionFromCode(current.weather_code),
      forecast,
      freshness: 'LIVE',
      source: 'Open-Meteo',
      lastUpdated: new Date().toISOString()
    };
  }

  private getConditionFromCode(code: number): string {
    // WMO Weather interpretation codes
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
    if (code === 45 || code === 48) return 'Fog';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Clear Sky';
  }
}
