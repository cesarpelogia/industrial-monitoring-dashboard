import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Efficiency } from '../Efficiency';

// Utilitário para criar dados OEE
const generateOEEData = (overrides: Partial<{
  overall: number;
  availability: number;
  performance: number;
  quality: number;
}> = {}) => ({
  overall: 85,
  availability: 90,
  performance: 88,
  quality: 92,
  ...overrides,
});

describe('Efficiency Component', () => {
  // 1. Renderização básica
  describe('Renderização básica', () => {
    it('renderiza título do componente', () => {
      const oeeData = generateOEEData();
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('Métricas de Eficiência')).toBeInTheDocument();
    });

    it('renderiza seção OEE principal', () => {
      const oeeData = generateOEEData();
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('OEE - Overall Equipment Effectiveness')).toBeInTheDocument();
      expect(screen.getByText('Métrica global de eficiência do equipamento')).toBeInTheDocument();
      expect(screen.getByText('Cálculo: Disponibilidade × Performance × Qualidade')).toBeInTheDocument();
    });

    it('renderiza as três métricas detalhadas', () => {
      const oeeData = generateOEEData();
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('Disponibilidade')).toBeInTheDocument();
      expect(screen.getByText('Tempo operacional vs. tempo planejado')).toBeInTheDocument();
      
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('Velocidade real vs. velocidade ideal')).toBeInTheDocument();
      
      expect(screen.getByText('Qualidade')).toBeInTheDocument();
      expect(screen.getByText('Produtos bons vs. total produzido')).toBeInTheDocument();
    });

    it('renderiza valores percentuais corretos', () => {
      const oeeData = generateOEEData({
        overall: 75,
        availability: 80,
        performance: 85,
        quality: 90
      });
      render(<Efficiency oeeData={oeeData} />);

      // Verifica se há pelo menos um elemento com cada valor
      expect(screen.getAllByText('75%').length).toBeGreaterThan(0);
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
    });
  });

  // 2. Níveis de performance
  describe('Níveis de performance', () => {
    it('exibe "Excelente" para valores ≥95%', () => {
      const oeeData = generateOEEData({ overall: 96 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('Excelente')).toBeInTheDocument();
      expect(screen.getByText('Excelente')).toHaveClass('text-green-600');
    });

    it('exibe "Bom" para valores entre 85-94%', () => {
      const oeeData = generateOEEData({ overall: 88 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('Bom')).toBeInTheDocument();
      expect(screen.getByText('Bom')).toHaveClass('text-blue-600');
    });

    it('exibe "Regular" para valores entre 75-84%', () => {
      const oeeData = generateOEEData({ overall: 78 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('Regular')).toBeInTheDocument();
      expect(screen.getByText('Regular')).toHaveClass('text-yellow-600');
    });

    it('exibe "Crítico" para valores <75%', () => {
      const oeeData = generateOEEData({ overall: 65 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('Crítico')).toBeInTheDocument();
      expect(screen.getByText('Crítico')).toHaveClass('text-red-600');
    });
  });

  // 3. Estrutura e layout
  describe('Estrutura e layout', () => {
    it('renderiza legenda com faixas de performance', () => {
      const oeeData = generateOEEData();
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('• Excelente: ≥95%')).toBeInTheDocument();
      expect(screen.getByText('• Bom: 85-94%')).toBeInTheDocument();
      expect(screen.getByText('• Regular: 75-84%')).toBeInTheDocument();
      expect(screen.getByText('• Crítico: <75%')).toBeInTheDocument();
    });

    it('aplica className personalizada quando fornecida', () => {
      const oeeData = generateOEEData();
      const { container } = render(<Efficiency oeeData={oeeData} className="custom-class" />);

      const component = container.firstChild as HTMLElement;
      expect(component).toHaveClass('custom-class');
    });

    it('renderiza seção de análise de performance', () => {
      const oeeData = generateOEEData();
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText('Análise de Performance')).toBeInTheDocument();
    });
  });

  // 4. Análise de performance e alertas
  describe('Análise de performance e alertas', () => {
    it('mostra alerta de disponibilidade baixa quando <90%', () => {
      const oeeData = generateOEEData({ availability: 85 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText(/Disponibilidade baixa - verificar paradas não planejadas/)).toBeInTheDocument();
    });

    it('mostra alerta de performance baixa quando <85%', () => {
      const oeeData = generateOEEData({ performance: 80 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText(/Performance abaixo do ideal - otimizar velocidade de operação/)).toBeInTheDocument();
    });

    it('mostra alerta de qualidade baixa quando <90%', () => {
      const oeeData = generateOEEData({ quality: 85 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText(/Qualidade comprometida - revisar parâmetros de processo/)).toBeInTheDocument();
    });

    it('mostra mensagem de sucesso quando OEE ≥85%', () => {
      const oeeData = generateOEEData({ overall: 90 });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.getByText(/Performance dentro dos padrões de excelência/)).toBeInTheDocument();
    });

    it('não mostra alertas quando todas as métricas estão dentro dos padrões', () => {
      const oeeData = generateOEEData({
        overall: 88,
        availability: 92,
        performance: 90,
        quality: 95
      });
      render(<Efficiency oeeData={oeeData} />);

      expect(screen.queryByText(/Disponibilidade baixa/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Performance abaixo do ideal/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Qualidade comprometida/)).not.toBeInTheDocument();
    });
  });
});
