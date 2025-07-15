'use client';

import { useState } from 'react';
import { useConfig } from '../hooks/useConfig';
import { TemperatureUnit } from '../types/index';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { config, setRefreshInterval, setTemperatureUnit, resetConfig } = useConfig();
  const [tempInterval, setTempInterval] = useState(config.refreshInterval);

  if (!isOpen) return null;

  const handleIntervalChange = (value: number) => {
    setTempInterval(value);
    setRefreshInterval(value);
  };

  const handleUnitChange = (unit: TemperatureUnit) => {
    setTemperatureUnit(unit);
  };

  const handleReset = () => {
    resetConfig();
    setTempInterval(3000);
  };

  const intervalInSeconds = tempInterval / 1000;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            ⚙️ Configurações
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Intervalo de Atualização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Intervalo de Atualização
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">2s</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {intervalInSeconds}s
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">10s</span>
              </div>
              <input
                type="range"
                min="2000"
                max="10000"
                step="1000"
                value={tempInterval}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((tempInterval - 2000) / 8000) * 100}%, #e5e7eb ${((tempInterval - 2000) / 8000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Controla a frequência de atualização dos dados em tempo real
              </p>
            </div>
          </div>

          {/* Unidade de Temperatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Unidade de Temperatura
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => handleUnitChange('celsius')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  config.temperatureUnit === 'celsius'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                °C (Celsius)
              </button>
              <button
                onClick={() => handleUnitChange('fahrenheit')}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  config.temperatureUnit === 'fahrenheit'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-blue-500 text-lg mr-2">ℹ️</span>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Dica:</strong> As configurações são salvas automaticamente e aplicadas em tempo real.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            🔄 Restaurar Padrões
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
