'use client';

import { useState, useEffect } from 'react';
import { formatShortRelativeTime, useIsClient } from '../lib/dateUtils';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate: Date;
  latency?: number;
  onReconnect?: () => void;
  showDetails?: boolean;
}

interface ConnectionHistory {
  timestamp: Date;
  event: 'connected' | 'disconnected' | 'reconnecting';
  duration?: number; // duração da desconexão em ms
}

export function ConnectionStatus({ 
  isConnected, 
  lastUpdate, 
  latency = 0, 
  onReconnect,
  showDetails = false 
}: ConnectionStatusProps) {
  const [history, setHistory] = useState<ConnectionHistory[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent');
  const isClient = useIsClient();

  // Monitora mudanças de conexão e atualiza histórico
  useEffect(() => {
    if (!isClient) return; // Só executa no cliente

    const newEvent: ConnectionHistory = {
      timestamp: new Date(),
      event: isConnected ? 'connected' : 'disconnected'
    };

    setHistory(prev => {
      const updated = [newEvent, ...prev];
      // Mantém apenas os últimos 10 eventos
      return updated.slice(0, 10);
    });
  }, [isConnected, isClient]);

  // Calcula qualidade da conexão baseada na latência
  useEffect(() => {
    if (!isConnected) {
      setConnectionQuality('offline');
    } else if (latency <= 50) {
      setConnectionQuality('excellent');
    } else if (latency <= 150) {
      setConnectionQuality('good');
    } else {
      setConnectionQuality('poor');
    }
  }, [isConnected, latency]);

  // Simula tentativa de reconexão
  const handleReconnect = async () => {
    setIsReconnecting(true);
    
    // Adiciona evento de reconectando ao histórico
    setHistory(prev => [{
      timestamp: new Date(),
      event: 'reconnecting'
    }, ...prev.slice(0, 9)]);

    // Simula delay de reconexão
    setTimeout(() => {
      setIsReconnecting(false);
      if (onReconnect) {
        onReconnect();
      }
    }, 2000);
  };

  const getStatusConfig = () => {
    if (isReconnecting) {
      return {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '🔄',
        text: 'Reconectando...',
        description: 'Tentando restabelecer conexão'
      };
    }

    if (!isConnected) {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🔴',
        text: 'Desconectado',
        description: 'Sem comunicação com o servidor'
      };
    }

    return {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: '🟢',
      text: 'Conectado',
      description: 'Comunicação ativa'
    };
  };

  const getLatencyDisplay = () => {
    if (!isConnected || latency === 0) return null;
    
    const qualityConfig = {
      excellent: { color: 'text-green-600', text: 'Excelente' },
      good: { color: 'text-blue-600', text: 'Boa' },
      poor: { color: 'text-orange-600', text: 'Ruim' },
      offline: { color: 'text-gray-500', text: 'Offline' }
    };

    const config = qualityConfig[connectionQuality];

    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">Latência:</span>
        <span className="font-medium">{latency}ms</span>
        <span className={`${config.color} font-medium`}>({config.text})</span>
      </div>
    );
  };

  const formatRelativeTime = (date: Date) => {
    return formatShortRelativeTime(date, isClient);
  };

  const status = getStatusConfig();

  if (!showDetails) {
    // Versão compacta para usar no Header
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status.color} ${isReconnecting ? 'animate-pulse' : ''}`} />
        <span className={`text-sm font-medium ${status.textColor}`}>
          {status.text}
        </span>
        {getLatencyDisplay()}
      </div>
    );
  }

  // Versão detalhada para usar como componente standalone
  return (
    <div className={`p-4 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status.color} ${isReconnecting ? 'animate-pulse' : ''}`} />
          <div>
            <h3 className={`font-semibold ${status.textColor}`}>
              {status.icon} {status.text}
            </h3>
            <p className="text-xs text-gray-600">{status.description}</p>
          </div>
        </div>

        {!isConnected && !isReconnecting && (
          <button
            onClick={handleReconnect}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
          >
            Reconectar
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Última atualização:</span>
          <span className="font-medium">{formatRelativeTime(lastUpdate)}</span>
        </div>

        {getLatencyDisplay()}

        {history.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              Histórico de conexão ({history.length})
            </summary>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {history.map((event, index) => {
                const eventConfig = {
                  connected: { icon: '🟢', color: 'text-green-600' },
                  disconnected: { icon: '🔴', color: 'text-red-600' },
                  reconnecting: { icon: '🔄', color: 'text-yellow-600' }
                };

                const config = eventConfig[event.event];

                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span className={config.color}>
                        {event.event === 'connected' ? 'Conectado' :
                         event.event === 'disconnected' ? 'Desconectado' : 'Reconectando'}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
