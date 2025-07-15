import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricCard } from '../MetricCard';

// Utilitário para criar props
const generateProps = (overrides: Partial<{
  title: string;
  value: string | number;
  unit: string;
  subtitle: string;
  trend: 'up' | 'down' | 'stable';
  statusColor: string;
  isAlert: boolean;
  maxValue: number;
}> = {}) => ({
  title: 'Temperatura',
  value: 75.5,
  unit: '°C',
  subtitle: 'Última leitura há 2 minutos',
  trend: 'stable' as const,
  statusColor: 'text-gray-800',
  isAlert: false,
  maxValue: 100,
  ...overrides,
});

describe('MetricCard Component', () => {
  // 1. Renderização básica
  describe('Renderização básica', () => {
    it('renderiza título, valor e subtítulo', () => {
      const props = generateProps();
      render(<MetricCard {...props} />);

      expect(screen.getByText('Temperatura')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
      expect(screen.getByText('Última leitura há 2 minutos')).toBeInTheDocument();
    });

    it('renderiza unidade quando fornecida', () => {
      const props = generateProps({ unit: '°C' });
      render(<MetricCard {...props} />);

      expect(screen.getByText('°C')).toBeInTheDocument();
    });

    it('não renderiza unidade quando não fornecida', () => {
      const props = { title: 'Status', value: 'ONLINE', subtitle: 'Sistema ativo' };
      render(<MetricCard {...props} />);

      expect(screen.queryByText('°C')).not.toBeInTheDocument();
    });

    it('formata valores numéricos com uma casa decimal', () => {
      const props = generateProps({ value: 123.456 });
      render(<MetricCard {...props} />);

      expect(screen.getByText('123.5')).toBeInTheDocument();
    });

    it('renderiza valores string sem formatação', () => {
      const props = generateProps({ value: 'OFFLINE' });
      render(<MetricCard {...props} />);

      expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });

    it('aplica statusColor ao valor', () => {
      const props = generateProps({ statusColor: 'text-blue-600' });
      render(<MetricCard {...props} />);

      const valueElement = screen.getByText('75.5');
      expect(valueElement).toHaveClass('text-blue-600');
    });

    it('renderiza estrutura básica do card', () => {
      const props = generateProps();
      const { container } = render(<MetricCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('bg-white');
      expect(cardElement).toHaveClass('p-4');
      expect(cardElement).toHaveClass('rounded-lg');
      expect(cardElement).toHaveClass('shadow-md');
    });
  });

  // 2. Indicadores de tendência
  describe('Indicadores de tendência', () => {
    it('exibe tendência UP corretamente', () => {
      const props = generateProps({ trend: 'up' });
      render(<MetricCard {...props} />);

      expect(screen.getByText('▲')).toBeInTheDocument();
      const trendElement = screen.getByText('▲');
      expect(trendElement).toHaveClass('text-red-500');
    });

    it('exibe tendência DOWN corretamente', () => {
      const props = generateProps({ trend: 'down' });
      render(<MetricCard {...props} />);

      expect(screen.getByText('▼')).toBeInTheDocument();
      const trendElement = screen.getByText('▼');
      expect(trendElement).toHaveClass('text-blue-500');
    });

    it('exibe tendência STABLE corretamente', () => {
      const props = generateProps({ trend: 'stable' });
      render(<MetricCard {...props} />);

      expect(screen.getByText('◆')).toBeInTheDocument();
      const trendElement = screen.getByText('◆');
      expect(trendElement).toHaveClass('text-gray-400');
    });

    it('usa tendência STABLE como padrão quando não especificada', () => {
      const props = { title: 'Test', value: 100, subtitle: 'Test subtitle' };
      render(<MetricCard {...props} />);

      expect(screen.getByText('◆')).toBeInTheDocument();
      const trendElement = screen.getByText('◆');
      expect(trendElement).toHaveClass('text-gray-400');
    });

    it('aplica margem esquerda aos ícones de tendência', () => {
      const props = generateProps({ trend: 'up' });
      render(<MetricCard {...props} />);

      const trendElement = screen.getByText('▲');
      expect(trendElement).toHaveClass('ml-1');
    });

    it('alterna entre diferentes tendências', () => {
      const props = generateProps({ trend: 'up' });
      const { rerender } = render(<MetricCard {...props} />);
      
      // UP
      expect(screen.getByText('▲')).toBeInTheDocument();
      
      // DOWN
      rerender(<MetricCard {...generateProps({ trend: 'down' })} />);
      expect(screen.getByText('▼')).toBeInTheDocument();
      
      // STABLE
      rerender(<MetricCard {...generateProps({ trend: 'stable' })} />);
      expect(screen.getByText('◆')).toBeInTheDocument();
    });
  });

  // 3. Barra de progresso
  describe('Barra de progresso', () => {
    it('exibe barra de progresso quando há valor numérico e maxValue', () => {
      const props = generateProps({ value: 75, maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressBar = document.querySelector('.bg-gray-200');
      expect(progressBar).toBeInTheDocument();
    });

    it('não exibe barra de progresso quando não há maxValue', () => {
      const props = { title: 'Test', value: 75, subtitle: 'Test' };
      render(<MetricCard {...props} />);

      const progressBar = document.querySelector('.bg-gray-200');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('não exibe barra de progresso para valores string', () => {
      const props = generateProps({ value: 'ONLINE', maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressBar = document.querySelector('.bg-gray-200');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('calcula porcentagem corretamente', () => {
      const props = generateProps({ value: 75, maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveStyle('width: 75%');
    });

    it('aplica cor verde para valores baixos (≤70%)', () => {
      const props = generateProps({ value: 50, maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-green-500');
    });

    it('aplica cor amarela para valores médios (70% < x ≤85%)', () => {
      const props = generateProps({ value: 80, maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-yellow-500');
    });

    it('aplica cor vermelha para valores altos (>85%)', () => {
      const props = generateProps({ value: 90, maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-red-500');
    });

    it('limita progresso a 100%', () => {
      const props = generateProps({ value: 150, maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveStyle('width: 100%');
    });

    it('testa limites exatos das cores', () => {
      // Exatamente 70% - deve ser verde
      const props70 = generateProps({ value: 70, maxValue: 100 });
      const { rerender } = render(<MetricCard {...props70} />);
      let progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-green-500');

      // Exatamente 85% - deve ser amarelo
      const props85 = generateProps({ value: 85, maxValue: 100 });
      rerender(<MetricCard {...props85} />);
      progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('bg-yellow-500');
    });

    it('aplica classes de transição na barra', () => {
      const props = generateProps({ value: 75, maxValue: 100 });
      render(<MetricCard {...props} />);

      const progressFill = document.querySelector('.h-2.rounded-full.transition-all');
      expect(progressFill).toHaveClass('duration-300');
    });
  });

  // 4. Sistema de alertas
  describe('Sistema de alertas', () => {
    it('exibe badge ALERTA quando isAlert é true', () => {
      const props = generateProps({ isAlert: true });
      render(<MetricCard {...props} />);

      expect(screen.getByText('ALERTA')).toBeInTheDocument();
    });

    it('não exibe badge ALERTA quando isAlert é false', () => {
      const props = generateProps({ isAlert: false });
      render(<MetricCard {...props} />);

      expect(screen.queryByText('ALERTA')).not.toBeInTheDocument();
    });

    it('aplica estilos de alerta corretamente', () => {
      const props = generateProps({ isAlert: true });
      const { container } = render(<MetricCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-red-500');
      expect(cardElement).toHaveClass('bg-red-50');
    });

    it('aplica estilos normais quando não está em alerta', () => {
      const props = generateProps({ isAlert: false });
      const { container } = render(<MetricCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-blue-500');
      expect(cardElement).not.toHaveClass('border-red-500');
      expect(cardElement).not.toHaveClass('bg-red-50');
    });

    it('estiliza o badge ALERTA corretamente', () => {
      const props = generateProps({ isAlert: true });
      render(<MetricCard {...props} />);

      const alertBadge = screen.getByText('ALERTA');
      expect(alertBadge).toHaveClass('text-red-500');
      expect(alertBadge).toHaveClass('text-xs');
      expect(alertBadge).toHaveClass('font-bold');
    });

    it('aplica classes de transição ao card', () => {
      const props = generateProps();
      const { container } = render(<MetricCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('transition-all');
      expect(cardElement).toHaveClass('duration-300');
    });

    it('aplica borda esquerda diferente baseada no estado de alerta', () => {
      const props = generateProps({ isAlert: true });
      const { container } = render(<MetricCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-l-4');
      expect(cardElement).toHaveClass('border-red-500');
    });

    it('mantém suporte a dark mode em alerta', () => {
      const props = generateProps({ isAlert: true });
      const { container } = render(<MetricCard {...props} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('dark:bg-red-900/20');
    });

    it('alterna entre estado normal e alerta', () => {
      const props = generateProps({ isAlert: false });
      const { rerender, container } = render(<MetricCard {...props} />);
      
      // Normal
      let cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-blue-500');
      expect(screen.queryByText('ALERTA')).not.toBeInTheDocument();
      
      // Alerta
      rerender(<MetricCard {...generateProps({ isAlert: true })} />);
      cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-red-500');
      expect(screen.getByText('ALERTA')).toBeInTheDocument();
    });
  });
});
