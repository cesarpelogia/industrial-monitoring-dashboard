// Tipos TypeScript obrigatórios conforme especificação do desafio

export interface MachineStatus {
  id: string;
  timestamp: Date;
  state: "RUNNING" | "STOPPED" | "MAINTENANCE" | "ERROR";
  metrics: {
    temperature: number;
    rpm: number;
    uptime: number;
    efficiency: number;
  };
  oee: {
    overall: number;
    availability: number;
    performance: number;
    quality: number;
  };
}

export interface Alert {
  id: string;
  level: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  component: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface MetricHistory {
  timestamp: Date;
  temperature: number;
  rpm: number;
  efficiency: number;
}

// Tipos auxiliares para componentes
export interface ChartDataPoint {
  timestamp: string;
  temperature: number;
  rpm: number;
  efficiency: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastUpdate: Date;
  latency?: number;
}

export type ThemeMode = 'light' | 'dark';
export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface DashboardConfig {
  theme: ThemeMode;
  refreshInterval: number; // em milissegundos (2000-10000)
  temperatureUnit: TemperatureUnit;
  alertSound: boolean;
  autoAcknowledge: boolean;
}

// Configurações padrão
export const DEFAULT_CONFIG: DashboardConfig = {
  theme: 'light',
  refreshInterval: 3000, // 3 segundos
  temperatureUnit: 'celsius',
  alertSound: true,
  autoAcknowledge: false,
};
