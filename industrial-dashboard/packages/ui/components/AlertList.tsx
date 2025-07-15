'use client';

import { Alert } from '../types/index';
import { formatRelativeTime, useIsClient } from '../lib/dateUtils';

export interface AlertListProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  maxVisible?: number;
}

export function AlertList({ alerts, onAcknowledge, maxVisible = 5 }: AlertListProps) {
  const isClient = useIsClient();

  const sortedAlerts = alerts
    .sort((a, b) => {
      // Primeiro por nível de prioridade
      const levelPriority = { CRITICAL: 3, WARNING: 2, INFO: 1 };
      const priorityDiff = levelPriority[b.level] - levelPriority[a.level];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Depois por timestamp (mais recente primeiro)
      return b.timestamp.getTime() - a.timestamp.getTime();
    })
    .slice(0, maxVisible);

  const getLevelStyles = (level: Alert['level']) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-300',
          badge: 'bg-red-500 text-white'
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          border: 'border-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-300',
          badge: 'bg-yellow-500 text-white'
        };
      case 'INFO':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-500',
          text: 'text-blue-700 dark:text-blue-300',
          badge: 'bg-blue-500 text-white'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-300',
          text: 'text-gray-700 dark:text-gray-300',
          badge: 'bg-gray-500 text-white'
        };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return formatRelativeTime(timestamp, isClient);
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
          Alertas Recentes
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="text-4xl mb-2">✅</div>
          <p>Nenhum alerta ativo</p>
          <p className="text-sm">Sistema operando normalmente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">
          Alertas Recentes
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {alerts.filter(a => !a.acknowledged).length} não confirmados
        </span>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {sortedAlerts.map((alert) => {
          const styles = getLevelStyles(alert.level);
          
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                styles.bg
              } ${styles.border} ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${styles.badge}`}>
                      {alert.level}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.component}
                    </span>
                  </div>
                  
                  <p className={`text-sm font-medium ${styles.text}`}>
                    {alert.message}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                    
                    {!alert.acknowledged && onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                    
                    {alert.acknowledged && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ✓ Confirmado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {alerts.length > maxVisible && (
        <div className="mt-3 text-center">
          <button className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
            Ver todos os alertas ({alerts.length})
          </button>
        </div>
      )}
    </div>
  );
}
