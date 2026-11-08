import { db, isDbAvailable } from '../../db/index.ts';
import { weatherCache } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import type { WeatherData, FreshnessState } from '../../types/weather.ts';
import type { WeatherProvider } from './WeatherProvider.ts';
import { OpenMeteoProvider } from './OpenMeteoProvider.ts';

export class WeatherManager {
  private provider: WeatherProvider;

  constructor(provider?: WeatherProvider) {
    this.provider = provider || new OpenMeteoProvider();
  }

  private calculateFreshness(timestamp: Date, isSimulated: boolean): FreshnessState {
    if (isSimulated) return 'SIMULATED';
    
    const now = new Date();
    const diffHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return 'RECENT';
    if (diffHours < 6) return 'CACHED';
    return 'STALE';
  }

  async getContextualWeather(lat: number, lon: number): Promise<WeatherData> {
    const locationKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

    try {
      // 1. Attempt to fetch fresh data from provider
      const liveData = await this.provider.getWeather(lat, lon);
      
      // 2. Cache the result (resilient: non-fatal if DB is unreachable)
      if (await isDbAvailable()) {
        try {
          await db.insert(weatherCache)
            .values({
              locationKey,
              data: liveData as any,
              timestamp: new Date()
            })
            .onConflictDoUpdate({
              target: weatherCache.locationKey,
              set: {
                data: liveData as any,
                timestamp: new Date()
              }
            });
        } catch {
          // Caching to DB is an optimization, don't fail live weather response
        }
      }

      // 3. Return with calculated freshness
      return {
        ...liveData,
        freshness: liveData.freshness === 'SIMULATED' ? 'SIMULATED' : 'LIVE',
        lastUpdated: new Date().toISOString()
      };
      
    } catch {
      // Fallback to cache if available
      if (await isDbAvailable()) {
        try {
          const cachedRecord = await db.select().from(weatherCache).where(eq(weatherCache.locationKey, locationKey));
          
          if (cachedRecord.length > 0) {
            const record = cachedRecord[0];
            const cachedData = record.data as unknown as WeatherData;
            const freshness = this.calculateFreshness(record.timestamp, cachedData.freshness === 'SIMULATED');
            
            return {
              ...cachedData,
              freshness,
              lastUpdated: record.timestamp.toISOString()
            };
          }
        } catch {
          // Fall back
        }
      }
      
      // If both live provider and cache lookup failed, generate robust simulated fallback weather data
      return {
        temperature: 28.5,
        humidity: 62,
        rainfallProbability: 10,
        condition: 'CLEAR',
        forecast: [
          { dayOffset: 1, temperature: 29.0, humidity: 60, rainfallProbability: 5, condition: 'Sunny' },
          { dayOffset: 2, temperature: 28.0, humidity: 65, rainfallProbability: 20, condition: 'Partly Cloudy' },
          { dayOffset: 3, temperature: 27.5, humidity: 70, rainfallProbability: 35, condition: 'Scattered Showers' }
        ],
        freshness: 'SIMULATED',
        lastUpdated: new Date().toISOString(),
        source: 'Open-Meteo (Simulated Backup)'
      };
    }
  }
}
