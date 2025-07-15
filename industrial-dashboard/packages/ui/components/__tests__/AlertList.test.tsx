import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertList } from '../AlertList';
import { Alert } from '../../types/index';

// Mock das funções externas
jest.mock('../../lib/dateUtils', () => ({
  useIsClient: () => true,
  formatRelativeTime: () => 'há 2 minutos',
}));

// Utilitário para criar alertas
const baseDate = new Date();
const generateAlert = (overrides: Partial<Alert>): Alert => ({
  id: '1',
  level: 'INFO',
  component: 'Sensor A',
  message: 'Mensagem padrão',
  timestamp: baseDate,
  acknowledged: false,
  ...overrides,
});

describe('AlertList Component', () => {
  // 1. Renderização básica
  it('exibe mensagem de sistema normal quando não há alertas', () => {
    render(<AlertList alerts={[]} />);
    expect(screen.getByText('Nenhum alerta ativo')).toBeInTheDocument();
    expect(screen.getByText('Sistema operando normalmente')).toBeInTheDocument();
  });

  // 2. Ordenação por severidade e data
  it('ordena os alertas por nível e data corretamente', () => {
    const alerts: Alert[] = [
      generateAlert({ id: '1', level: 'INFO', timestamp: new Date('2024-01-01') }),
      generateAlert({ id: '2', level: 'WARNING', timestamp: new Date('2024-01-02') }),
      generateAlert({ id: '3', level: 'CRITICAL', timestamp: new Date('2024-01-03') }),
      generateAlert({ id: '4', level: 'WARNING', timestamp: new Date('2024-01-04') }),
    ];

    render(<AlertList alerts={alerts} />);

    const alertBadges = screen.getAllByText(/INFO|WARNING|CRITICAL/);

    expect(alertBadges[0]).toHaveTextContent('CRITICAL'); // mais prioritário
    expect(alertBadges[1]).toHaveTextContent('WARNING');  // mais recente
    expect(alertBadges[2]).toHaveTextContent('WARNING');  // mais antigo
    expect(alertBadges[3]).toHaveTextContent('INFO');     // menos prioritário
  });

  // 3. Estilos por nível
  it('aplica estilos corretos para CRITICAL', () => {
    const alert = generateAlert({ id: '1', level: 'CRITICAL', message: 'Alerta crítico' });
    render(<AlertList alerts={[alert]} />);
    const badge = screen.getByText('CRITICAL');
    expect(badge).toHaveClass('bg-red-500', 'text-white');
  });

  it('aplica estilos corretos para WARNING', () => {
    const alert = generateAlert({ id: '2', level: 'WARNING', message: 'Alerta warning' });
    render(<AlertList alerts={[alert]} />);
    const badge = screen.getByText('WARNING');
    expect(badge).toHaveClass('bg-yellow-500', 'text-white');
  });

  it('aplica estilos corretos para INFO', () => {
    const alert = generateAlert({ id: '3', level: 'INFO', message: 'Alerta info' });
    render(<AlertList alerts={[alert]} />);
    const badge = screen.getByText('INFO');
    expect(badge).toHaveClass('bg-blue-500', 'text-white');
  });
});
