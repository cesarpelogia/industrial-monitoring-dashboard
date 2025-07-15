import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectionStatus } from '../ConnectionStatus';

// Mock das funções externas
jest.mock('../../lib/dateUtils', () => ({
  useIsClient: () => true,
  formatShortRelativeTime: () => 'há 2 minutos',
}));

// Utilitário para criar props
const generateProps = (overrides: Partial<{
  isConnected: boolean;
  lastUpdate: Date;
  latency: number;
  onReconnect: () => void;
  showDetails: boolean;
}> = {}) => ({
  isConnected: true,
  lastUpdate: new Date('2024-01-01T10:00:00'),
  latency: 50,
  onReconnect: jest.fn(),
  showDetails: false,
  ...overrides,
});

describe('ConnectionStatus Component', () => {
  // 1. Renderização básica
  describe('Renderização básica', () => {
    it('renderiza versão compacta quando showDetails é false', () => {
      const props = generateProps();
      render(<ConnectionStatus {...props} />);

      expect(screen.getByText('Conectado')).toBeInTheDocument();
      expect(screen.getByText('50ms')).toBeInTheDocument();
      expect(screen.getByText('(Excelente)')).toBeInTheDocument();
    });

    it('renderiza versão detalhada quando showDetails é true', () => {
      const props = generateProps({ showDetails: true });
      render(<ConnectionStatus {...props} />);

      expect(screen.getByText('🟢 Conectado')).toBeInTheDocument();
      expect(screen.getByText('Comunicação ativa')).toBeInTheDocument();
      expect(screen.getByText('Última atualização:')).toBeInTheDocument();
      // Verifica se há pelo menos um elemento com o texto
      expect(screen.getAllByText('há 2 minutos').length).toBeGreaterThan(0);
    });

    it('renderiza histórico de conexão na versão detalhada', () => {
      const props = generateProps({ showDetails: true });
      render(<ConnectionStatus {...props} />);

      expect(screen.getByText(/Histórico de conexão/)).toBeInTheDocument();
    });
  });

  // 2. Estados de conexão
  describe('Estados de conexão', () => {
    it('exibe estado conectado corretamente', () => {
      const props = generateProps({ isConnected: true });
      render(<ConnectionStatus {...props} />);

      expect(screen.getByText('Conectado')).toBeInTheDocument();
      expect(screen.getByText('Conectado')).toHaveClass('text-green-700');
    });

    it('exibe estado desconectado corretamente', () => {
      const props = generateProps({ isConnected: false });
      render(<ConnectionStatus {...props} />);

      expect(screen.getByText('Desconectado')).toBeInTheDocument();
      expect(screen.getByText('Desconectado')).toHaveClass('text-red-700');
    });

    it('exibe botão de reconectar quando desconectado na versão detalhada', () => {
      const props = generateProps({ isConnected: false, showDetails: true });
      render(<ConnectionStatus {...props} />);

      expect(screen.getByText('Reconectar')).toBeInTheDocument();
    });

    it('não exibe botão de reconectar quando conectado', () => {
      const props = generateProps({ isConnected: true, showDetails: true });
      render(<ConnectionStatus {...props} />);

      expect(screen.queryByText('Reconectar')).not.toBeInTheDocument();
    });

    it('exibe qualidade de conexão baseada na latência', () => {
      // Latência excelente (≤50ms)
      const excellentProps = generateProps({ latency: 30 });
      const { rerender } = render(<ConnectionStatus {...excellentProps} />);
      expect(screen.getByText('(Excelente)')).toBeInTheDocument();

      // Latência boa (≤150ms)
      const goodProps = generateProps({ latency: 100 });
      rerender(<ConnectionStatus {...goodProps} />);
      expect(screen.getByText('(Boa)')).toBeInTheDocument();

      // Latência ruim (>150ms)
      const poorProps = generateProps({ latency: 200 });
      rerender(<ConnectionStatus {...poorProps} />);
      expect(screen.getByText('(Ruim)')).toBeInTheDocument();
    });
  });

  // 3. Funcionalidade de reconexão
  describe('Funcionalidade de reconexão', () => {
    it('chama onReconnect quando botão de reconectar é clicado', async () => {
      const onReconnect = jest.fn();
      const props = generateProps({ 
        isConnected: false, 
        showDetails: true, 
        onReconnect 
      });
      
      render(<ConnectionStatus {...props} />);

      const reconnectButton = screen.getByText('Reconectar');
      fireEvent.click(reconnectButton);

      // Aguarda o timeout de reconexão (2000ms)
      await waitFor(() => {
        expect(onReconnect).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('exibe estado de reconectando durante o processo', async () => {
      const props = generateProps({ 
        isConnected: false, 
        showDetails: true 
      });
      
      render(<ConnectionStatus {...props} />);

      const reconnectButton = screen.getByText('Reconectar');
      fireEvent.click(reconnectButton);

      // Verifica se o estado de reconectando aparece
      expect(screen.getByText('🔄 Reconectando...')).toBeInTheDocument();
      expect(screen.getByText('Tentando restabelecer conexão')).toBeInTheDocument();
    });
  });
});
