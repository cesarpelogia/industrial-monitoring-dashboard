import { TemperatureUnit } from '../types/index';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function convertTemperature(value: number, _fromUnit: TemperatureUnit, _toUnit: TemperatureUnit): number {
  return value; // Sempre retorna o valor original já que só temos Celsius
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatTemperature(value: number, _unit: TemperatureUnit, decimals: number = 1): string {
  return `${value.toFixed(decimals)}°C`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getTemperatureUnit(_unit: TemperatureUnit): string {
  return '°C';
}

export function formatUptime(uptimeMinutos: number): string {
    const hours = Math.floor(uptimeMinutos / 60);
    const minutes = Math.floor(uptimeMinutos % 60);

    if (hours === 0) {
        return `${minutes}min`;
    }
    return `${hours}h ${minutes}min`;
}