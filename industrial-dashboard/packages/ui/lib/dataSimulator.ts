import { MachineStatus, Alert, MetricHistory, ConnectionStatus } from '../types/index';

// Simulador de dados em tempo real para o dashboard industrial
class IndustrialDataSimulator {
  private currentStatus: MachineStatus;
  private alerts: Alert[] = [];
  private history: MetricHistory[] = [];
  private connectionStatus: ConnectionStatus;
  private listeners: ((data: MachineStatus) => void)[] = [];

  constructor() {
    this.connectionStatus = {
      isConnected: true,
      lastUpdate: new Date(),
      latency: 45
    };

    // Estado inicial da máquina (Misturador Industrial)
    this.currentStatus = {
      id: 'MIXER_001',
      timestamp: new Date(),
      state: 'RUNNING',
      metrics: {
        temperature: 75,
        rpm: 1200,
        uptime: 0,
        efficiency: 92
      },
      oee: {
        overall: 92,
        availability: 98,
        performance: 95,
        quality: 94
      }
    };

    // Inicializa histórico com dados das últimas 2 horas
    this.generateInitialHistory();
    this.generateInitialAlerts();
    this.startSimulation();
  }

  private generateInitialHistory(): void {
    const now = new Date();
    for (let i = 120; i >= 0; i -= 5) { // Últimas 2 horas, a cada 5 minutos
      const timestamp = new Date(now.getTime() - i * 60 * 1000);
      this.history.push({
        timestamp,
        temperature: 70 + Math.random() * 15, // 70-85°C
        rpm: 1100 + Math.random() * 400, // 1100-1500 RPM
        efficiency: 85 + Math.random() * 15 // 85-100%
      });
    }
  }

  private generateInitialAlerts(): void {
    const now = new Date();
    
    this.alerts = [
      {
        id: 'alert_001',
        level: 'CRITICAL',
        message: 'Temperatura acima do limite crítico (85°C)',
        component: 'Sistema de Resfriamento',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 min atrás
        acknowledged: false
      },
      {
        id: 'alert_002',
        level: 'WARNING',
        message: 'RPM abaixo do ideal para eficiência máxima',
        component: 'Motor Principal',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 min atrás
        acknowledged: false
      },
      {
        id: 'alert_003',
        level: 'INFO',
        message: 'Manutenção preventiva agendada para amanhã',
        component: 'Sistema Geral',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 min atrás
        acknowledged: true
      }
    ];
  }

  private startSimulation(): void {
    // Atualiza dados a cada 3 segundos (conforme requisito: 2-5 segundos)
    setInterval(() => {
      this.updateMachineStatus();
      this.updateConnectionStatus();
      this.notifyListeners();
    }, 3000);

    // Gera novos alertas ocasionalmente
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance a cada verificação
        this.generateRandomAlert();
      }
    }, 30000); // A cada 30 segundos
  }

  private updateMachineStatus(): void {
    const now = new Date();
    
    // Simula variações realistas nos dados
    const tempVariation = (Math.random() - 0.5) * 3; // ±1.5°C
    const rpmVariation = (Math.random() - 0.5) * 50; // ±25 RPM
    const efficiencyVariation = (Math.random() - 0.5) * 4; // ±2%

    // Atualiza métricas com limites realistas
    this.currentStatus.metrics.temperature = Math.max(65, Math.min(90, 
      this.currentStatus.metrics.temperature + tempVariation
    ));
    
    this.currentStatus.metrics.rpm = Math.max(800, Math.min(1600, 
      this.currentStatus.metrics.rpm + rpmVariation
    ));
    
    this.currentStatus.metrics.efficiency = Math.max(70, Math.min(100, 
      this.currentStatus.metrics.efficiency + efficiencyVariation
    ));

    // Atualiza uptime (em minutos)
    this.currentStatus.metrics.uptime += 0.05; // 3 segundos = 0.05 minutos

    // Recalcula OEE baseado nas métricas atuais
    this.updateOEE();

    // Atualiza timestamp
    this.currentStatus.timestamp = now;

    // Adiciona ao histórico
    this.history.push({
      timestamp: now,
      temperature: this.currentStatus.metrics.temperature,
      rpm: this.currentStatus.metrics.rpm,
      efficiency: this.currentStatus.metrics.efficiency
    });

    // Mantém apenas as últimas 2 horas de histórico
    const twoHoursAgo = now.getTime() - 2 * 60 * 60 * 1000;
    this.history = this.history.filter(entry => entry.timestamp.getTime() > twoHoursAgo);

    // Simula mudanças de estado ocasionais
    this.simulateStateChanges();
  }

  private updateOEE(): void {
    const metrics = this.currentStatus.metrics;
    
    // Disponibilidade: baseada no uptime vs tempo total
    const availability = Math.min(100, 95 + (metrics.efficiency - 85) / 3);
    
    // Performance: baseada no RPM atual vs RPM ideal (1400)
    const performance = Math.min(100, (metrics.rpm / 1400) * 100);
    
    // Qualidade: simulada baseada na temperatura (ideal: 70-80°C)
    const tempDeviation = Math.abs(metrics.temperature - 75) / 10;
    const quality = Math.max(80, 100 - tempDeviation * 20);

    this.currentStatus.oee = {
      availability: Math.round(availability),
      performance: Math.round(performance),
      quality: Math.round(quality),
      overall: Math.round((availability * performance * quality) / 10000)
    };
  }

  private simulateStateChanges(): void {
    // 1% chance de mudança de estado a cada atualização
    if (Math.random() < 0.01) {
      const states: MachineStatus['state'][] = ['RUNNING', 'STOPPED', 'MAINTENANCE', 'ERROR'];
      const currentIndex = states.indexOf(this.currentStatus.state);
      
      
      // Evita mudanças muito frequentes para ERROR
      if (this.currentStatus.state === 'ERROR' && Math.random() < 0.7) {
        this.currentStatus.state = 'RUNNING';
      } else {
        const availableStates = states.filter((_, index) => index !== currentIndex);
        this.currentStatus.state = availableStates[Math.floor(Math.random() * availableStates.length)] as MachineStatus['state'];
      }
    }
  }

  private updateConnectionStatus(): void {
    // Simula perda de conexão ocasional (2% chance)
    if (Math.random() < 0.02) {
      this.connectionStatus.isConnected = false;
      
      // Reconecta após 5-15 segundos
      setTimeout(() => {
        this.connectionStatus.isConnected = true;
        this.connectionStatus.lastUpdate = new Date();
        this.connectionStatus.latency = 20 + Math.random() * 80; // 20-100ms
      }, 5000 + Math.random() * 10000);
    } else {
      this.connectionStatus.lastUpdate = new Date();
      this.connectionStatus.latency = 20 + Math.random() * 80;
    }
  }

  private generateRandomAlert(): void {
    const alertTemplates = [
      { level: 'WARNING' as const, message: 'Vibração elevada detectada', component: 'Sistema Mecânico' },
      { level: 'INFO' as const, message: 'Limpeza automática iniciada', component: 'Sistema de Limpeza' },
      { level: 'CRITICAL' as const, message: 'Pressão hidráulica crítica', component: 'Sistema Hidráulico' },
      { level: 'WARNING' as const, message: 'Consumo energético acima do normal', component: 'Sistema Elétrico' },
      { level: 'INFO' as const, message: 'Backup de dados concluído', component: 'Sistema de Dados' }
    ];

    const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
    
    if (!template) {
      // Se não houver template, não gera alerta
      return;
    }

    const newAlert: Alert = {
      id: `alert_${Date.now()}`,
      level: template.level,
      message: template.message,
      component: template.component,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.unshift(newAlert); // Adiciona no início da lista
    
    // Mantém apenas os últimos 20 alertas
    if (this.alerts.length > 20) {
      this.alerts = this.alerts.slice(0, 20);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  // Métodos públicos para acesso aos dados
  public getCurrentStatus(): MachineStatus {
    return { ...this.currentStatus };
  }

  public getHistory(): MetricHistory[] {
    return [...this.history];
  }

  // Novo método: Filtra histórico por período em minutos
  public getHistoryByPeriod(minutes: number): MetricHistory[] {
    const now = new Date();
    const periodAgo = now.getTime() - minutes * 60 * 1000;
    
    return this.history.filter(entry => entry.timestamp.getTime() > periodAgo);
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  public subscribe(listener: (data: MachineStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Retorna função para cancelar a inscrição
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Método para forçar desconexão (para testes)
  public simulateDisconnection(duration: number = 10000): void {
    this.connectionStatus.isConnected = false;
    setTimeout(() => {
      this.connectionStatus.isConnected = true;
      this.connectionStatus.lastUpdate = new Date();
    }, duration);
  }
}

// Instância singleton do simulador
export const dataSimulator = new IndustrialDataSimulator();
