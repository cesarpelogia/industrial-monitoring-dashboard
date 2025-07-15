import { useLocalStorage } from './useLocalStorage';
import { DashboardConfig, DEFAULT_CONFIG } from '../types/index';

/**
 * Hook para gerenciar configurações do dashboard
 * Persiste automaticamente no localStorage
 */
export function useConfig() {
  const [config, setConfig] = useLocalStorage<DashboardConfig>('dashboard-config', DEFAULT_CONFIG);

  const updateConfig = (newConfig: Partial<DashboardConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // Validações e limitações
  const setRefreshInterval = (interval: number) => {
    // Limita entre 2 e 10 segundos
    const validInterval = Math.max(2000, Math.min(10000, interval));
    updateConfig({ refreshInterval: validInterval });
  };

  const setTemperatureUnit = (unit: 'celsius') => {
    updateConfig({ temperatureUnit: unit });
  };

  const setAlertSound = (enabled: boolean) => {
    updateConfig({ alertSound: enabled });
  };

  const setAutoAcknowledge = (enabled: boolean) => {
    updateConfig({ autoAcknowledge: enabled });
  };

  return {
    config,
    updateConfig,
    resetConfig,
    setRefreshInterval,
    setTemperatureUnit,
    setAlertSound,
    setAutoAcknowledge,
  };
}
