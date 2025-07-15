'use client';

import { dataSimulator } from '../../../packages/ui/lib/dataSimulator';
import { Header } from '../../../packages/ui/components/Header';
import { MachineStatusCard } from '../../../packages/ui/components/MachineStatusCard';
import { ChartPanel } from '../../../packages/ui/components/ChartPanel';
import { AlertList } from '../../../packages/ui/components/AlertList';
import { Efficiency } from '../../../packages/ui/components/Efficiency';
import { formatUptime } from '../../../packages/ui/lib/utils';
import { useConfig } from '../../../packages/ui/hooks/useConfig';
import { useIsClient } from '../../../packages/ui/lib/dateUtils';
import { useState, useEffect } from 'react';


export default function Home() {
  const { config } = useConfig();
  const isClient = useIsClient();
  const [currentStatus, setCurrentStatus] = useState(() => dataSimulator.getCurrentStatus());
  const [connectionStatus, setConnectionStatus] = useState(() => dataSimulator.getConnectionStatus());
  const [selectedPeriod, setSelectedPeriod] = useState(60); 
  const [chartData, setChartData] = useState(() => dataSimulator.getHistoryByPeriod(60));
  const [alerts, setAlerts] = useState(() => dataSimulator.getAlerts());

  // Atualiza dados após hidratação
  useEffect(() => {
    if (isClient) {
      setCurrentStatus(dataSimulator.getCurrentStatus());
      setConnectionStatus(dataSimulator.getConnectionStatus());
      setAlerts(dataSimulator.getAlerts());
      setChartData(dataSimulator.getHistoryByPeriod(60));
    }
  }, [isClient]);

  // Efeito para aplicar mudanças de intervalo
  useEffect(() => {
    if (isClient) {
      dataSimulator.setUpdateInterval(config.refreshInterval);
    }
  }, [config.refreshInterval, isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const unsubscribe = dataSimulator.subscribe((data) => {
      setCurrentStatus(data);
      setConnectionStatus(dataSimulator.getConnectionStatus());
      setAlerts(dataSimulator.getAlerts());
      setChartData(dataSimulator.getHistoryByPeriod(selectedPeriod));
    });

    return unsubscribe;
  }, [selectedPeriod, isClient]);

  // Renderização de loading durante hidratação
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    dataSimulator.acknowledgeAlert(alertId);
    setAlerts(dataSimulator.getAlerts());
  };

  const handlePeriodChange = (minutes: number) => {
    setSelectedPeriod(minutes);
    setChartData(dataSimulator.getHistoryByPeriod(minutes));
  };

  const handleLimitViolation = (metric: string, value: number, limit: number) => {
    // O simulador já gera os alertas automaticamente
    // Este callback pode ser usado para logs ou outras ações
    console.log(`Limite violado - ${metric}: ${value} (limite: ${limit})`);
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <Header 
          isConnected={connectionStatus.isConnected}
          lastUpdate={connectionStatus.lastUpdate}
        />
        
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MachineStatusCard
            title="Temperatura"
            value={currentStatus.metrics.temperature}
            unit="°C"
            subtitle="Máx: 85°C"
            trend={currentStatus.metrics.temperature > 80 ? 'up' : 'stable'}
            statusColor="text-orange-500"
            maxValue={85}
            minValue={60}
            isAlert={currentStatus.metrics.temperature > 85}
            isTemperature={true}
            temperatureUnit={config.temperatureUnit}
          />
          <MachineStatusCard
            title="RPM"
            value={currentStatus.metrics.rpm}
            subtitle="Máx: 1500"
            trend={currentStatus.metrics.rpm < 1100 ? 'down' : 'stable'}
            statusColor="text-blue-500"
            maxValue={1500}
            minValue={800}
            isAlert={currentStatus.metrics.rpm < 1000}
          />
          <MachineStatusCard
            title="Eficiência"
            value={currentStatus.metrics.efficiency}
            unit="%"
            subtitle="Meta: 95%"
            trend={currentStatus.metrics.efficiency >= 95 ? 'up' : 'stable'}
            statusColor="text-green-600"
            maxValue={100}
            minValue={0}
          />
          <MachineStatusCard
            title="Tempo de Operação"
            value={formatUptime(currentStatus.metrics.uptime)}
            subtitle="Tempo contínuo"
            machineState={currentStatus.state}
            statusColor="text-green-600"
            trend="stable"
          />
        </section>
        
        <section className="mb-6">
          <ChartPanel 
            data={chartData} 
            onPeriodChange={handlePeriodChange}
            onLimitViolation={handleLimitViolation}
          />
        </section>
        
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <AlertList 
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            maxVisible={5}
          />
          <Efficiency oeeData={currentStatus.oee} />
        </section>
      </div>
    </main>
  );
}
