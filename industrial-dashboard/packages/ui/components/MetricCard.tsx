'use client';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  trend?: 'up' | 'down' | 'stable';
  statusColor?: string;
  isAlert?: boolean;
  maxValue?: number;
}

export function MetricCard({ 
  title, 
  value, 
  unit = '', 
  subtitle, 
  trend = 'stable',
  statusColor = 'text-gray-800',
  isAlert = false,
  maxValue 
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-red-500 ml-1">▲</span>;
      case 'down':
        return <span className="text-blue-500 ml-1">▼</span>;
      case 'stable':
      default:
        return <span className="text-gray-400 ml-1">◆</span>;
    }
  };

  const getProgressBar = () => {
    if (!maxValue || typeof value !== 'number') return null;
    
    const percentage = Math.min((value / maxValue) * 100, 100);
    const barColor = percentage > 85 ? 'bg-red-500' : 
                    percentage > 70 ? 'bg-yellow-500' : 'bg-green-500';
    
    return (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 ${
      isAlert ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-blue-500'
    }`}>
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-600 dark:text-gray-300 text-sm">{title}</h3>
        {isAlert && (
          <span className="text-red-500 text-xs font-bold">ALERTA</span>
        )}
      </div>
      
      <div className="flex items-baseline mt-1">
        <p className={`text-2xl font-bold ${statusColor} dark:text-white`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
        </p>
        {getTrendIcon()}
      </div>
      
      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{subtitle}</p>
      {getProgressBar()}
    </div>
  );
}
