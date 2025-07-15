import { TemperatureUnit } from '../types/index';

// Conversões de temperatura
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

export function convertTemperature(value: number, fromUnit: TemperatureUnit, toUnit: TemperatureUnit): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
    return celsiusToFahrenheit(value);
  }
  
  if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
    return fahrenheitToCelsius(value);
  }
  
  return value;
}

export function formatTemperature(value: number, unit: TemperatureUnit, decimals: number = 1): string {
  return `${value.toFixed(decimals)}°${unit === 'celsius' ? 'C' : 'F'}`;
}

export function getTemperatureUnit(unit: TemperatureUnit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatUptime(uptimeMinutos: number): string {
    const hours = Math.floor(uptimeMinutos / 60);
    const minutes = Math.floor(uptimeMinutos % 60);

    if (hours === 0) {
        return `${minutes}min`;
    }
    return `${hours}h ${minutes}min`;
}