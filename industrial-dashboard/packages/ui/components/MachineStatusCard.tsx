'use client';

import { MachineStatus } from '../types/index';

interface MachineStatusCardProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  machineState?: MachineStatus['state'];
  trend?: 'up' | 'down' | 'stable';
  statusColor?: string;
  maxValue?: number;
  minValue?: number;
  isAlert?: boolean;
  className?: string;
}

export function MachineStatusCard({
  title,
  value,
  unit = '',
  subtitle,
  machineState,
  trend = 'stable',
  statusColor = 'text-blue-500',
  maxValue,
  minValue = 0,
  isAlert = false,
  className = ''
}: MachineStatusCardProps) {

  // Configurações de estado da máquina
  const getStateConfig = (state?: MachineStatus['state']) => {
    switch (state) {
      case 'RUNNING':
        return {
          icon: '🟢',
          text: 'Operando',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'STOPPED':
        return {
          icon: '🔴',
          text: 'Parada',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'MAINTENANCE':
        return {
          icon: '🟡',
          text: 'Manutenção',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'ERROR':
        return {
          icon: '🔴',
          text: 'Erro',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300'
        };
      default:
        return {
          icon: '⚪',
          text: 'Desconhecido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Configurações de tendência
  const getTrendConfig = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return {
          icon: '↗️',
          color: 'text-green-600',
          text: 'Subindo'
        };
      case 'down':
        return {
          icon: '↘️',
          color: 'text-red-600',
          text: 'Descendo'
        };
      case 'stable':
      default:
        return {
          icon: '➡️',
          color: 'text-blue-600',
          text: 'Estável'
        };
    }
  };

  // Calcula porcentagem para barra de progresso
  const getProgressPercentage = () => {
    if (typeof value !== 'number' || !maxValue) return 0;
    return Math.min(100, Math.max(0, ((value - minValue) / (maxValue - minValue)) * 100));
  };

  // Configurações de alerta
  const getAlertStyle = () => {
    if (isAlert) {
      return 'border-red-400 bg-red-50 shadow-red-200';
    }
    return 'border-gray-200 bg-white';
  };

  const stateConfig = getStateConfig(machineState);
  const trendConfig = getTrendConfig(trend);
  const progressPercentage = getProgressPercentage();

  return (
    <div className={`
      p-4 rounded-lg border-2 shadow-md transition-all duration-200 hover:shadow-lg
      bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
      ${getAlertStyle()}
      ${className}
    `}>
      {/* Header com título e estado da máquina */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {title}
          </h3>
          {machineState && (
            <div className={`flex items-center gap-1 mt-1 ${stateConfig.color} dark:brightness-110`}>
              <span>{stateConfig.icon}</span>
              <span className="text-xs font-medium">{stateConfig.text}</span>
            </div>
          )}
        </div>
        
        {/* Indicador de tendência */}
        <div className={`flex items-center gap-1 ${trendConfig.color} dark:brightness-110`} title={trendConfig.text}>
          <span className="text-sm">{trendConfig.icon}</span>
        </div>
      </div>

      {/* Valor principal */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${isAlert ? 'text-red-600 dark:text-red-400' : statusColor + ' dark:brightness-110'}`}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{unit}</span>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Barra de progresso (apenas para valores numéricos com maxValue) */}
      {typeof value === 'number' && maxValue && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isAlert 
                  ? 'bg-red-500 dark:bg-red-400' 
                  : progressPercentage > 80 
                    ? 'bg-orange-500 dark:bg-orange-400' 
                    : 'bg-blue-500 dark:bg-blue-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{minValue}</span>
            <span>{maxValue}{unit}</span>
          </div>
        </div>
      )}

      {/* Indicador de alerta */}
      {isAlert && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
          <span className="text-sm">⚠️</span>
          <span className="text-xs font-medium">Atenção requerida</span>
        </div>
      )}
    </div>
  );
}
