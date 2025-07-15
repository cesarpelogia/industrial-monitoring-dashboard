import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MachineStatusCard } from '../MachineStatusCard';
import { MachineStatus } from '../../types/index';

// Utilitário para criar props
const generateProps = (overrides: Partial<{
  title: string;
  value: number | string;
  unit: string;
  subtitle: string;
  machineState: MachineStatus['state'];
  trend: 'up' | 'down' | 'stable';
  statusColor: string;
  maxValue: number;
  minValue: number;
  isAlert: boolean;
  className: string;
}> = {}) => ({
  title: 'Temperatura',
  value: 75.5,
  unit: '°C',
  subtitle: 'Sensor principal',
  machineState: 'RUNNING' as MachineStatus['state'],
  trend: 'stable' as const,
  statusColor: 'text-blue-500',
  maxValue: 100,
  minValue: 0,
  isAlert: false,
  className: '',
  ...overrides,
});

describe('MachineStatusCard Component', () => {
  // 1. Renderização básica
  describe('Renderização básica', () => {
    it('renderiza título e valor principal', () => {
      const props = generateProps();
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('Temperatura')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
    });

    it('renderiza unidade quando fornecida', () => {
      const props = generateProps({ unit: '°C' });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('°C')).toBeInTheDocument();
    });

    it('não renderiza unidade quando não fornecida', () => {
      const props = { title: 'Temperatura', value: 75.5 };
      render(<MachineStatusCard {...props} />);

      expect(screen.queryByText('°C')).not.toBeInTheDocument();
    });

    it('renderiza subtítulo quando fornecido', () => {
      const props = generateProps({ subtitle: 'Sensor principal' });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('Sensor principal')).toBeInTheDocument();
    });

    it('não renderiza subtítulo quando não fornecido', () => {
      const props = { title: 'Temperatura', value: 75.5 };
      render(<MachineStatusCard {...props} />);

      expect(screen.queryByText('Sensor principal')).not.toBeInTheDocument();
    });

    it('renderiza valores string corretamente', () => {
      const props = generateProps({ value: 'OFFLINE' });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });

    it('formata valores numéricos com uma casa decimal', () => {
      const props = generateProps({ value: 123.456 });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('123.5')).toBeInTheDocument();
    });
  });

  // 2. Estados da máquina
  describe('Estados da máquina', () => {
    it('exibe estado RUNNING corretamente', () => {
      const props = generateProps({ machineState: 'RUNNING' });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('🟢')).toBeInTheDocument();
      expect(screen.getByText('Operando')).toBeInTheDocument();
    });

    it('exibe estado STOPPED corretamente', () => {
      const props = generateProps({ machineState: 'STOPPED' });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('🔴')).toBeInTheDocument();
      expect(screen.getByText('Parada')).toBeInTheDocument();
    });

    it('exibe estado MAINTENANCE corretamente', () => {
      const props = generateProps({ machineState: 'MAINTENANCE' });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('🟡')).toBeInTheDocument();
      expect(screen.getByText('Manutenção')).toBeInTheDocument();
    });

    it('exibe estado ERROR corretamente', () => {
      const props = generateProps({ machineState: 'ERROR' });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('🔴')).toBeInTheDocument();
      expect(screen.getByText('Erro')).toBeInTheDocument();
    });

    it('exibe estado desconhecido quando machineState é undefined', () => {
      const props = { title: 'Temperatura', value: 75.5 };
      render(<MachineStatusCard {...props} />);

      // Não deve renderizar nenhum estado quando não fornecido
      expect(screen.queryByText('Operando')).not.toBeInTheDocument();
      expect(screen.queryByText('Parada')).not.toBeInTheDocument();
      expect(screen.queryByText('Manutenção')).not.toBeInTheDocument();
      expect(screen.queryByText('Erro')).not.toBeInTheDocument();
    });

    it('aplica cores corretas para cada estado', () => {
      // Estado RUNNING
      const runningProps = generateProps({ machineState: 'RUNNING' });
      const { rerender } = render(<MachineStatusCard {...runningProps} />);
      let stateElement = screen.getByText('Operando').parentElement;
      expect(stateElement).toHaveClass('text-green-600');

      // Estado STOPPED
      const stoppedProps = generateProps({ machineState: 'STOPPED' });
      rerender(<MachineStatusCard {...stoppedProps} />);
      stateElement = screen.getByText('Parada').parentElement;
      expect(stateElement).toHaveClass('text-red-600');

      // Estado MAINTENANCE
      const maintenanceProps = generateProps({ machineState: 'MAINTENANCE' });
      rerender(<MachineStatusCard {...maintenanceProps} />);
      stateElement = screen.getByText('Manutenção').parentElement;
      expect(stateElement).toHaveClass('text-yellow-600');

      // Estado ERROR
      const errorProps = generateProps({ machineState: 'ERROR' });
      rerender(<MachineStatusCard {...errorProps} />);
      stateElement = screen.getByText('Erro').parentElement;
      expect(stateElement).toHaveClass('text-red-700');
    });
  });

  // 4. Barra de progresso
  describe('Barra de progresso', () => {
    it('exibe barra de progresso quando há valor numérico e maxValue', () => {
      const props = generateProps({ value: 75, maxValue: 100, minValue: 0 });
      render(<MachineStatusCard {...props} />);

      // Verifica se a barra de progresso está presente usando uma classe específica
      const progressBar = document.querySelector('.bg-gray-200');
      expect(progressBar).toBeInTheDocument();
      
      // Verifica labels min/max
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('100°C')).toBeInTheDocument();
    });

    it('não exibe barra de progresso quando não há maxValue', () => {
      const props = { title: 'Temperatura', value: 75 };
      render(<MachineStatusCard {...props} />);

      // Não deve ter a estrutura de progresso
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('não exibe barra de progresso para valores string', () => {
      const props = generateProps({ value: 'ONLINE', maxValue: 100 });
      render(<MachineStatusCard {...props} />);

      // Não deve ter a estrutura de progresso para strings
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('calcula porcentagem corretamente', () => {
      const props = generateProps({ value: 75, maxValue: 100, minValue: 0 });
      render(<MachineStatusCard {...props} />);

      // Verifica se a barra tem a largura correta (75%)
      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveStyle('width: 75%');
    });

    it('aplica cor normal para progresso baixo', () => {
      const props = generateProps({ value: 50, maxValue: 100 });
      render(<MachineStatusCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-blue-500');
    });

    it('aplica cor de atenção para progresso alto', () => {
      const props = generateProps({ value: 85, maxValue: 100 });
      render(<MachineStatusCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-orange-500');
    });

    it('limita progresso a 100%', () => {
      const props = generateProps({ value: 120, maxValue: 100, minValue: 0 });
      render(<MachineStatusCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveStyle('width: 100%');
    });

    it('limita progresso a 0% para valores negativos', () => {
      const props = generateProps({ value: -10, maxValue: 100, minValue: 0 });
      render(<MachineStatusCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveStyle('width: 0%');
    });
  });

  // 5. Sistema de alertas
  describe('Sistema de alertas', () => {
    it('exibe indicador de alerta quando isAlert é true', () => {
      const props = generateProps({ isAlert: true });
      render(<MachineStatusCard {...props} />);

      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Atenção requerida')).toBeInTheDocument();
    });

    it('não exibe indicador de alerta quando isAlert é false', () => {
      const props = generateProps({ isAlert: false });
      render(<MachineStatusCard {...props} />);

      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
      expect(screen.queryByText('Atenção requerida')).not.toBeInTheDocument();
    });

    it('aplica estilos de alerta corretamente', () => {
      const props = generateProps({ isAlert: true });
      const { container } = render(<MachineStatusCard {...props} />);

      // Verifica se o container principal tem as classes de alerta
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-red-400');
      expect(cardElement).toHaveClass('bg-red-50');
    });

    it('aplica cor vermelha ao valor principal quando em alerta', () => {
      const props = generateProps({ isAlert: true, value: 95.5 });
      render(<MachineStatusCard {...props} />);

      const valueElement = screen.getByText('95.5');
      expect(valueElement).toHaveClass('text-red-600');
    });

    it('aplica cor vermelha à barra de progresso quando em alerta', () => {
      const props = generateProps({ isAlert: true, value: 85, maxValue: 100 });
      render(<MachineStatusCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-red-500');
    });

    it('mantém cores normais quando não está em alerta', () => {
      const props = generateProps({ isAlert: false, value: 75.5 });
      render(<MachineStatusCard {...props} />);

      const valueElement = screen.getByText('75.5');
      expect(valueElement).toHaveClass('text-blue-500');
      expect(valueElement).not.toHaveClass('text-red-600');
    });
  });

  // 7. Estilos e classes CSS
  describe('Estilos e classes CSS', () => {
    it('aplica className customizada', () => {
      const props = generateProps({ className: 'custom-class' });
      const { container } = render(<MachineStatusCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('custom-class');
    });

    it('aplica classes básicas de estilo', () => {
      const props = generateProps();
      const { container } = render(<MachineStatusCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('p-4');
      expect(cardElement).toHaveClass('rounded-lg');
      expect(cardElement).toHaveClass('border-2');
      expect(cardElement).toHaveClass('shadow-md');
    });

    it('aplica classes de transição e hover', () => {
      const props = generateProps();
      const { container } = render(<MachineStatusCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('transition-all');
      expect(cardElement).toHaveClass('duration-200');
      expect(cardElement).toHaveClass('hover:shadow-lg');
    });

    it('aplica suporte a dark mode', () => {
      const props = generateProps();
      const { container } = render(<MachineStatusCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('dark:bg-gray-800');
      expect(cardElement).toHaveClass('dark:border-gray-700');
    });

    it('aplica statusColor customizada ao valor', () => {
      const props = generateProps({ statusColor: 'text-purple-600' });
      render(<MachineStatusCard {...props} />);

      const valueElement = screen.getByText('75.5');
      expect(valueElement).toHaveClass('text-purple-600');
    });

    it('mantém estrutura responsiva', () => {
      const props = generateProps();
      render(<MachineStatusCard {...props} />);

      // Verifica se elementos têm classes responsivas
      const titleElement = screen.getByText('Temperatura');
      expect(titleElement).toHaveClass('text-sm');
      
      const valueElement = screen.getByText('75.5');
      expect(valueElement).toHaveClass('text-2xl');
    });
  });
});
