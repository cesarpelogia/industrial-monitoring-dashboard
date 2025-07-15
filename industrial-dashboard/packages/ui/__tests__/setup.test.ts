/**
 * Teste simples para verificar se o ambiente de testes está funcionando
 */

describe('Ambiente de Testes', () => {
  it('deve estar configurado corretamente', () => {
    expect(true).toBe(true);
  });

  it('deve conseguir fazer cálculos básicos', () => {
    expect(2 + 2).toBe(4);
  });

  it('deve ter jsdom configurado', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
