'use client';

import { MachineStatus } from '../types/index';

export interface EfficiencyProps {
  oeeData: MachineStatus['oee'];
  className?: string;
}

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
}

const CircularProgress = ({ percentage, color, size = 80 }: CircularProgressProps) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'stroke-blue-500',
      green: 'stroke-green-500',
      purple: 'stroke-purple-500',
      orange: 'stroke-orange-500'
    };
    return colors[color] || 'stroke-blue-500';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="4"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={getColorClass(color)}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold text-gray-800 dark:text-white`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export function Efficiency({ oeeData, className = '' }: EfficiencyProps) {
  const metrics = [
    {
      label: 'OEE Geral',
      value: oeeData.overall,
      description: 'Eficiência Geral do Equipamento',
      color: 'blue'
    },
    {
      label: 'Disponibilidade',
      value: oeeData.availability,
      description: 'Tempo operacional vs. tempo planejado',
      color: 'green'
    },
    {
      label: 'Performance',
      value: oeeData.performance,
      description: 'Velocidade real vs. velocidade ideal',
      color: 'purple'
    },
    {
      label: 'Qualidade',
      value: oeeData.quality,
      description: 'Produtos bons vs. total produzido',
      color: 'orange'
    }
  ];

  const getPerformanceLevel = (value: number) => {
    if (value >= 95) return { text: 'Excelente', color: 'text-green-600' };
    if (value >= 85) return { text: 'Bom', color: 'text-blue-600' };
    if (value >= 75) return { text: 'Regular', color: 'text-yellow-600' };
    return { text: 'Crítico', color: 'text-red-600' };
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
          Métricas de Eficiência
        </h3>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getPerformanceLevel(oeeData.overall).color}`}>
            {oeeData.overall}%
          </div>
          <div className={`text-sm ${getPerformanceLevel(oeeData.overall).color}`}>
            {getPerformanceLevel(oeeData.overall).text}
          </div>
        </div>
      </div>

      {/* OEE Principal - Destaque */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white">
              OEE - Overall Equipment Effectiveness
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Métrica global de eficiência do equipamento
            </p>
            <div className="mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Cálculo: Disponibilidade × Performance × Qualidade
              </span>
            </div>
          </div>
          <CircularProgress 
            percentage={oeeData.overall} 
            color="blue" 
            size={100}
          />
        </div>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.slice(1).map((metric) => (
          <div key={metric.label} className="text-center">
            <CircularProgress 
              percentage={metric.value} 
              color={metric.color}
              size={80}
            />
            <div className="mt-3">
              <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                {metric.label}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Insights e Recomendações */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-3">
          Análise de Performance
        </h4>
        <div className="space-y-2">
          {oeeData.availability < 90 && (
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Disponibilidade baixa - verificar paradas não planejadas
            </div>
          )}
          {oeeData.performance < 85 && (
            <div className="text-sm text-orange-600 dark:text-orange-400">
              📉 Performance abaixo do ideal - otimizar velocidade de operação
            </div>
          )}
          {oeeData.quality < 90 && (
            <div className="text-sm text-red-600 dark:text-red-400">
              🔧 Qualidade comprometida - revisar parâmetros de processo
            </div>
          )}
          {oeeData.overall >= 85 && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✅ Performance dentro dos padrões de excelência
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="grid grid-cols-2 gap-2">
          <div>• Excelente: ≥95%</div>
          <div>• Bom: 85-94%</div>
          <div>• Regular: 75-84%</div>
          <div>• Crítico: &lt;75%</div>
        </div>
      </div>
    </div>
  );
}
