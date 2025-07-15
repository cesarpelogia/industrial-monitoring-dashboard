import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChartPanel } from '../ChartPanel';

// Interface local para corresponder ao componente
interface MetricHistory {
  timestamp: Date;
  temperature: number;
  rpm: number;
  efficiency: number;
}

// Mock do Recharts para simplificar os testes
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ name, dataKey }: { name: string; dataKey: string }) => <div data-testid={`line-${dataKey}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  ReferenceLine: ({ y }: { y: number }) => <div data-testid={`reference-line-${y}`} />,
}));

// Utilitário para criar dados de teste
const generateMetricHistory = (overrides: Partial<MetricHistory>[] = []): MetricHistory[] => {
  const baseData: MetricHistory[] = [
    {
      timestamp: new Date('2024-01-01T10:00:00'),
      temperature: 75,
      rpm: 1400,
      efficiency: 98,
    },
    {
      timestamp: new Date('2024-01-01T10:01:00'),
      temperature: 80,
      rpm: 1450,
      efficiency: 97,
    },
  ];

  return overrides.length > 0 ? overrides.map((override, index) => ({
    ...baseData[index] || baseData[0],
    ...override,
  })) : baseData;
};

describe('ChartPanel Component', () => {
  // 1. Renderização básica
  describe('Renderização básica', () => {
    it('renderiza o componente com título e controles', () => {
      const data = generateMetricHistory();
      render(<ChartPanel data={data} />);

      expect(screen.getByText('Gráfico de Métricas')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  // 2. Seleção de período
  describe('Seleção de período', () => {
    it('chama onPeriodChange quando o período é alterado', () => {
      const data = generateMetricHistory();
      const onPeriodChange = jest.fn();
      render(<ChartPanel data={data} onPeriodChange={onPeriodChange} />);

      const periodSelect = screen.getByLabelText('Período:');
      fireEvent.change(periodSelect, { target: { value: '30' } });

      expect(onPeriodChange).toHaveBeenCalledWith(30);
    });

    it('atualiza o estado interno quando o período é alterado', () => {
      const data = generateMetricHistory();
      render(<ChartPanel data={data} />);

      const periodSelect = screen.getByLabelText('Período:') as HTMLSelectElement;
      fireEvent.change(periodSelect, { target: { value: '120' } });

      expect(periodSelect.value).toBe('120');
    });

    it('renderiza todas as opções de período disponíveis', () => {
      const data = generateMetricHistory();
      render(<ChartPanel data={data} />);

      expect(screen.getByText('Últimos 15 min')).toBeInTheDocument();
      expect(screen.getByText('Últimos 30 min')).toBeInTheDocument();
      expect(screen.getByText('Última 1 hora')).toBeInTheDocument();
      expect(screen.getByText('Últimas 2 horas')).toBeInTheDocument();
      expect(screen.getByText('Últimas 4 horas')).toBeInTheDocument();
    });
  });

  // 3. Verificação de violações de limites
  describe('Verificação de violações de limites', () => {
    it('chama onLimitViolation quando temperatura excede o limite máximo', () => {
      const onLimitViolation = jest.fn();
      const data = generateMetricHistory([
        {
          timestamp: new Date(),
          temperature: 90, // Acima do limite máximo de 85
          rpm: 1400,
          efficiency: 98,
        }
      ]);

      render(<ChartPanel data={data} onLimitViolation={onLimitViolation} />);

      expect(onLimitViolation).toHaveBeenCalledWith('temperature', 90, 85);
    });

    it('chama onLimitViolation quando temperatura está abaixo do limite mínimo', () => {
      const onLimitViolation = jest.fn();
      const data = generateMetricHistory([
        {
          timestamp: new Date(),
          temperature: 50, // Abaixo do limite mínimo de 60
          rpm: 1400,
          efficiency: 98,
        }
      ]);

      render(<ChartPanel data={data} onLimitViolation={onLimitViolation} />);

      expect(onLimitViolation).toHaveBeenCalledWith('temperature', 50, 60);
    });

    it('chama onLimitViolation quando RPM excede o limite máximo', () => {
      const onLimitViolation = jest.fn();
      const data = generateMetricHistory([
        {
          timestamp: new Date(),
          temperature: 75,
          rpm: 1600, // Acima do limite máximo de 1500
          efficiency: 98,
        }
      ]);

      render(<ChartPanel data={data} onLimitViolation={onLimitViolation} />);

      expect(onLimitViolation).toHaveBeenCalledWith('rpm', 1600, 1500);
    });

    it('chama onLimitViolation quando eficiência está abaixo do limite mínimo', () => {
      const onLimitViolation = jest.fn();
      const data = generateMetricHistory([
        {
          timestamp: new Date(),
          temperature: 75,
          rpm: 1400,
          efficiency: 90, // Abaixo do limite mínimo de 95
        }
      ]);

      render(<ChartPanel data={data} onLimitViolation={onLimitViolation} />);

      expect(onLimitViolation).toHaveBeenCalledWith('efficiency', 90, 95);
    });

    it('não chama onLimitViolation quando todos os valores estão dentro dos limites', () => {
      const onLimitViolation = jest.fn();
      const data = generateMetricHistory([
        {
          timestamp: new Date(),
          temperature: 75, // Dentro dos limites (60-85)
          rpm: 1400,       // Dentro dos limites (1000-1500)
          efficiency: 98,  // Dentro dos limites (95-100)
        }
      ]);

      render(<ChartPanel data={data} onLimitViolation={onLimitViolation} />);

      expect(onLimitViolation).not.toHaveBeenCalled();
    });


  });
});
