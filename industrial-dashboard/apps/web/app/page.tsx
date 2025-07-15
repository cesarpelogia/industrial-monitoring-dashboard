'use client';

import { dataSimulator } from '../../../packages/ui/lib/dataSimulator';
import { Header } from '../../../packages/ui/components/Header';
import { MachineStatusCard } from '../../../packages/ui/components/MachineStatusCard';
import { ChartPanel } from '../../../packages/ui/components/ChartPanel';
import { AlertList } from '../../../packages/ui/components/AlertList';
import { Efficiency } from '../../../packages/ui/components/Efficiency';
import { formatUptime } from '../../../packages/ui/lib/utils';
import { useState, useEffect } from 'react';


export default function Home() {
  const [currentStatus, setCurrentStatus] = useState(dataSimulator.getCurrentStatus());
  const [connectionStatus, setConnectionStatus] = useState(dataSimulator.getConnectionStatus());
  const [selectedPeriod, setSelectedPeriod] = useState(60); 
  const [chartData, setChartData] = useState(dataSimulator.getHistoryByPeriod(60));
  const [alerts, setAlerts] = useState(dataSimulator.getAlerts());

  useEffect(() => {
    const unsubscribe = dataSimulator.subscribe((data) => {
      setCurrentStatus(data);
      setConnectionStatus(dataSimulator.getConnectionStatus());
      setAlerts(dataSimulator.getAlerts());
      setChartData(dataSimulator.getHistoryByPeriod(selectedPeriod));
    });

    return unsubscribe;
  }, [selectedPeriod]);

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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
      <Header 
        isConnected={connectionStatus.isConnected}
        lastUpdate={connectionStatus.lastUpdate}
      />
      
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <section className="mt-6">
        <ChartPanel 
          data={chartData} 
          onPeriodChange={handlePeriodChange}
          onLimitViolation={handleLimitViolation}
        />
      </section>
      <section className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <AlertList 
          alerts={alerts}
          onAcknowledge={handleAcknowledgeAlert}
          maxVisible={5}
        />
        <Efficiency oeeData={currentStatus.oee} />
      </section>
    </main>
  );
}
