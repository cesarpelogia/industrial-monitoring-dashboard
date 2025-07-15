'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useState } from 'react';

interface MetricHistory {
  timestamp: Date;
  temperature: number;
  rpm: number;
  efficiency: number;
}

interface Props {
  data: MetricHistory[];
  onPeriodChange?: (minutes: number) => void;
  onLimitViolation?: (metric: string, value: number, limit: number) => void;
}

// Configurações completas para cada métrica com valores ideais e escalas
const METRIC_CONFIGS = {
  temperature: {
    ideal: 75,     // Temperatura ideal
    max: 85,       // Limite máximo crítico
    min: 60,       // Limite mínimo operacional
    name: 'Temperatura',
    unit: '°C',
    color: '#f59e0b',
    scale: { min: 55, max: 90 }  // Escala otimizada para visualização
  },
  rpm: {
    ideal: 1400,   // RPM ideal
    max: 1500,     // Limite máximo crítico
    min: 1000,     // Limite mínimo operacional
    name: 'RPM',
    unit: ' RPM',
    color: '#3b82f6',
    scale: { min: 900, max: 1600 }  // Escala otimizada para visualização
  },
  efficiency: {
    ideal: 98,     // Eficiência ideal
    max: 100,      // Limite máximo teórico
    min: 95,       // Limite mínimo aceitável
    name: 'Eficiência',
    unit: '%',
    color: '#10b981',
    scale: { min: 90, max: 100 }  // Escala otimizada para visualização
  }
} as const;

export function ChartPanel({ data, onPeriodChange, onLimitViolation }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState(60); // 60 minutos por padrão
  const [visibleMetrics, setVisibleMetrics] = useState({
    temperature: true,
    rpm: true,
    efficiency: true
  });

  const periodOptions = [
    { value: 15, label: 'Últimos 15 min' },
    { value: 30, label: 'Últimos 30 min' },
    { value: 60, label: 'Última 1 hora' },
    { value: 120, label: 'Últimas 2 horas' },
    { value: 240, label: 'Últimas 4 horas' },
  ];

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => {
      const newVisibleMetrics = {
        ...prev,
        [metric]: !prev[metric]
      };
      
      // Verifica se pelo menos uma métrica ficará ativa
      const activeMetrics = Object.values(newVisibleMetrics).filter(Boolean);
      
      // Se só restaria esta métrica ativa, não permite desativar
      if (activeMetrics.length === 0) {
        return prev; // Mantém o estado atual
      }
      
      return newVisibleMetrics;
    });
  };

  // Verifica violações de limite
  const checkLimitViolations = (point: MetricHistory) => {
    Object.entries(METRIC_CONFIGS).forEach(([metric, config]) => {
      const value = point[metric as keyof MetricHistory] as number;
      if (typeof value === 'number') {
        let violation = false;
        let limitValue = 0;

        // Verifica se está fora dos limites operacionais
        if (value > config.max) {
          violation = true;
          limitValue = config.max;
        } else if (value < config.min) {
          violation = true;
          limitValue = config.min;
        }

        if (violation) {
          onLimitViolation?.(metric, value, limitValue);
        }
      }
    });
  };

  // Normaliza valores para proporção de 0-100 baseado na faixa operacional
  const normalizeValue = (value: number, metric: keyof typeof METRIC_CONFIGS) => {
    const config = METRIC_CONFIGS[metric];
    const range = config.scale.max - config.scale.min;
    const normalizedValue = ((value - config.scale.min) / range) * 100;
    return Math.max(0, Math.min(100, normalizedValue));
  };

  // Formata os dados para o chart e verifica limites
  const chartData = data.map(point => {
    // Verifica violações para o ponto mais recente
    if (point === data[data.length - 1]) {
      checkLimitViolations(point);
    }

    const visibleMetricsCount = Object.values(visibleMetrics).filter(Boolean).length;
    const useNormalization = visibleMetricsCount > 1;

    return {
      time: point.timestamp.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      temperature: useNormalization ? normalizeValue(point.temperature, 'temperature') : point.temperature,
      rpm: useNormalization ? normalizeValue(point.rpm, 'rpm') : point.rpm,
      efficiency: useNormalization ? normalizeValue(point.efficiency, 'efficiency') : point.efficiency,
      // Mantém valores originais para tooltip
      originalTemperature: point.temperature,
      originalRpm: point.rpm,
      originalEfficiency: point.efficiency,
      timestamp: point.timestamp.getTime()
    };
  });

  // Calcula a escala Y dinâmica baseada nas métricas visíveis
  const getDynamicScale = () => {
    const visibleMetricsCount = Object.values(visibleMetrics).filter(Boolean).length;
    
    // Se apenas uma métrica está visível, usa escala absoluta
    if (visibleMetricsCount === 1) {
      const visibleMetric = Object.entries(visibleMetrics)
        .find(([, visible]) => visible)?.[0] as keyof typeof METRIC_CONFIGS;
      
      if (visibleMetric) {
        const config = METRIC_CONFIGS[visibleMetric];
        return [config.scale.min, config.scale.max];
      }
    }
    
    // Se múltiplas métricas, usa escala normalizada 0-100%
    return [0, 100];
  };

  const currentScale = getDynamicScale();

  // Define o intervalo dos ticks baseado na quantidade de dados
  const getTickInterval = () => {
    if (chartData.length <= 10) return 0;
    if (chartData.length <= 30) return Math.floor(chartData.length / 5);
    return Math.floor(chartData.length / 8);
  };

  // Componente customizado para o Tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      name: string;
      value: number;
      dataKey: string;
      payload?: {
        originalTemperature: number;
        originalRpm: number;
        originalEfficiency: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const visibleMetricsCount = Object.values(visibleMetrics).filter(Boolean).length;
      const useNormalization = visibleMetricsCount > 1;

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{`Horário: ${label}`}</p>
          {payload.map((entry, index: number) => {
            // Usa valores originais para exibição no tooltip
            let displayValue = entry.value;
            let unit = '';
            
            if (useNormalization && entry.payload) {
              if (entry.dataKey === 'temperature') {
                displayValue = entry.payload.originalTemperature;
                unit = '°C';
              } else if (entry.dataKey === 'rpm') {
                displayValue = entry.payload.originalRpm;
                unit = ' RPM';
              } else if (entry.dataKey === 'efficiency') {
                displayValue = entry.payload.originalEfficiency;
                unit = '%';
              }
            } else {
              unit = entry.dataKey === 'temperature' ? '°C' :
                     entry.dataKey === 'efficiency' ? '%' : ' RPM';
            }

            return (
              <p
                key={index}
                style={{ color: entry.color }}
                className="text-sm font-medium"
              >
                {`${entry.name}: ${typeof displayValue === 'number' ? displayValue.toFixed(1) : displayValue}${unit}`}
                {useNormalization && (
                  <span className="text-xs opacity-70 ml-1">
                    ({entry.value.toFixed(1)}%)
                  </span>
                )}
              </p>
            );
          })}
          {useNormalization && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
              * Valores em proporção 0-100% de suas faixas operacionais
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full h-[600px]'>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gráfico de Métricas</h2>
        <div className="flex items-center gap-4">
          {/* Seleção de métricas */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exibir:</span>
            <div className="flex gap-2">
              <button
                onClick={() => toggleMetric('temperature')}
                className={`px-2 py-1 text-xs rounded ${
                  visibleMetrics.temperature 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                Temp
              </button>
              <button
                onClick={() => toggleMetric('rpm')}
                className={`px-2 py-1 text-xs rounded ${
                  visibleMetrics.rpm 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                RPM
              </button>
              <button
                onClick={() => toggleMetric('efficiency')}
                className={`px-2 py-1 text-xs rounded ${
                  visibleMetrics.efficiency 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                Efic
              </button>
            </div>
          </div>
          
          {/* Seleção de período */}
          <div className="flex items-center gap-2">
            <label htmlFor="period-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Período:
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => {
                const newPeriod = Number(e.target.value);
                setSelectedPeriod(newPeriod);
                if (onPeriodChange) {
                  onPeriodChange(newPeriod);
                }
              }}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legenda com informações completas */}
      <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-6 mb-1">
          {visibleMetrics.temperature && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-amber-500 inline-block"></span>
              <span>Temp: {METRIC_CONFIGS.temperature.ideal}°C ideal | {METRIC_CONFIGS.temperature.min}-{METRIC_CONFIGS.temperature.max}°C limites</span>
            </div>
          )}
          {visibleMetrics.rpm && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
              <span>RPM: {METRIC_CONFIGS.rpm.ideal} ideal | {METRIC_CONFIGS.rpm.min}-{METRIC_CONFIGS.rpm.max} limites</span>
            </div>
          )}
          {visibleMetrics.efficiency && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-green-500 inline-block"></span>
              <span>Efic: {METRIC_CONFIGS.efficiency.ideal}% ideal | {METRIC_CONFIGS.efficiency.min}-{METRIC_CONFIGS.efficiency.max}% limites</span>
            </div>
          )}
        </div>
        {Object.values(visibleMetrics).filter(Boolean).length === 1 && (
          <div className="flex flex-wrap gap-4 mb-1 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-green-500 inline-block"></span>
              <span>Ideal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500 inline-block" style={{borderStyle: 'dashed'}}></span>
              <span>Crítico</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-0.5 border-t border-orange-500 inline-block" style={{borderStyle: 'dotted'}}></span>
              <span>Mínimo</span>
            </div>
          </div>
        )}
        {Object.values(visibleMetrics).filter(Boolean).length > 1 && (
          <div className="text-xs italic text-amber-600 dark:text-amber-400">
            ⚡ Modo Comparativo: Valores normalizados proporcionalmente (0-100% de suas faixas operacionais)
          </div>
        )}
      </div>

      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval={getTickInterval()}
              className="text-gray-600 dark:text-gray-400"
            />
            
            {/* Eixo Y dinâmico baseado nas métricas visíveis */}
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={currentScale}
              className="text-gray-600 dark:text-gray-400"
            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: 'rgb(107 114 128)' // text-gray-500
              }}
            />

            {/* Linhas de referência - apenas quando uma métrica estiver visível */}
            {Object.values(visibleMetrics).filter(Boolean).length === 1 && (
              <>
                {visibleMetrics.temperature && (
                  <>
                    {/* Linha ideal temperatura */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.temperature.ideal} 
                      stroke="#10b981" 
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      strokeOpacity={0.8}
                    />
                    {/* Linha limite máximo temperatura */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.temperature.max} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      strokeOpacity={0.8}
                    />
                    {/* Linha limite mínimo temperatura */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.temperature.min} 
                      stroke="#f97316" 
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      strokeOpacity={0.6}
                    />
                  </>
                )}
                {visibleMetrics.rpm && (
                  <>
                    {/* Linha ideal RPM */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.rpm.ideal} 
                      stroke="#10b981" 
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      strokeOpacity={0.8}
                    />
                    {/* Linha limite máximo RPM */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.rpm.max} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      strokeOpacity={0.8}
                    />
                    {/* Linha limite mínimo RPM */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.rpm.min} 
                      stroke="#f97316" 
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      strokeOpacity={0.6}
                    />
                  </>
                )}
                {visibleMetrics.efficiency && (
                  <>
                    {/* Linha ideal eficiência */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.efficiency.ideal} 
                      stroke="#10b981" 
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      strokeOpacity={0.8}
                    />
                    {/* Linha limite máximo eficiência */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.efficiency.max} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      strokeOpacity={0.8}
                    />
                    {/* Linha limite mínimo eficiência */}
                    <ReferenceLine 
                      y={METRIC_CONFIGS.efficiency.min} 
                      stroke="#f97316" 
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      strokeOpacity={0.6}
                    />
                  </>
                )}
              </>
            )}

            {/* Linhas de dados condicionais baseadas na visibilidade */}
            {visibleMetrics.temperature && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke={METRIC_CONFIGS.temperature.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={METRIC_CONFIGS.temperature.name}
                connectNulls={false}
              />
            )}
            {visibleMetrics.rpm && (
              <Line
                type="monotone"
                dataKey="rpm"
                stroke={METRIC_CONFIGS.rpm.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={METRIC_CONFIGS.rpm.name}
                connectNulls={false}
              />
            )}
            {visibleMetrics.efficiency && (
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke={METRIC_CONFIGS.efficiency.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={METRIC_CONFIGS.efficiency.name}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
