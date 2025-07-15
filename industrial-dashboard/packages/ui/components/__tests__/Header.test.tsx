import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header, useDarkMode } from '../Header';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    matches: false,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Utilitário para criar props
const generateProps = (overrides: Partial<{
  isConnected: boolean;
  lastUpdate: Date;
}> = {}) => ({
  isConnected: true,
  lastUpdate: new Date('2024-01-01T10:00:00'),
  ...overrides,
});

// Hook wrapper para testar o useDarkMode
function TestHookComponent() {
  const hook = useDarkMode();
  return (
    <div>
      <span data-testid="isDarkMode">{hook.isDarkMode.toString()}</span>
      <span data-testid="userPreference">{hook.userPreference}</span>
      <span data-testid="isSystemDark">{hook.isSystemDark.toString()}</span>
      <button data-testid="toggleTheme" onClick={hook.toggleTheme}>
        Toggle
      </button>
      <button data-testid="setLight" onClick={() => hook.setTheme('light')}>
        Light
      </button>
      <button data-testid="setDark" onClick={() => hook.setTheme('dark')}>
        Dark
      </button>
    </div>
  );
}

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // 1. Renderização básica
  describe('Renderização básica', () => {
    it('renderiza logo e título principal', () => {
      const props = generateProps();
      render(<Header {...props} />);

      expect(screen.getByText('🏭 Industrial Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard de Monitoramento')).toBeInTheDocument();
    });

    it('renderiza todos os elementos principais', () => {
      const props = generateProps();
      render(<Header {...props} />);

      // Logo e título
      expect(screen.getByText('🏭 Industrial Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard de Monitoramento')).toBeInTheDocument();
      
      // Status de conexão
      expect(screen.getByText('Conectado')).toBeInTheDocument();
      
      // Botão de tema (usando title em vez de name)
      expect(screen.getByTitle('Modo atual: Automático - Clique para alternar')).toBeInTheDocument();
      
      // Botão de configurações
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });

    it('renderiza última atualização quando fornecida', () => {
      const lastUpdate = new Date('2024-01-01T10:30:45');
      const props = generateProps({ lastUpdate });
      render(<Header {...props} />);

      expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
      expect(screen.getByText(/10:30:45/)).toBeInTheDocument();
    });

    it('não renderiza última atualização quando não fornecida', () => {
      const props = { isConnected: true };
      render(<Header {...props} />);

      expect(screen.queryByText(/Última atualização:/)).not.toBeInTheDocument();
    });
  });

  // 2. Estados de conexão
  describe('Estados de conexão', () => {
    it('exibe estado conectado corretamente', () => {
      const props = generateProps({ isConnected: true });
      render(<Header {...props} />);

      expect(screen.getByText('Conectado')).toBeInTheDocument();
      
      // Verifica se o indicador visual está verde
      const indicator = screen.getByText('Conectado').previousElementSibling;
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('exibe estado desconectado corretamente', () => {
      const props = generateProps({ isConnected: false });
      render(<Header {...props} />);

      expect(screen.getByText('Desconectado')).toBeInTheDocument();
      
      // Verifica se o indicador visual está vermelho
      const indicator = screen.getByText('Desconectado').previousElementSibling;
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('aplica cores corretas baseadas no estado de conexão e tema', () => {
      // Estado conectado
      const connectedProps = generateProps({ isConnected: true });
      const { rerender } = render(<Header {...connectedProps} />);
      
      let statusText = screen.getByText('Conectado');
      expect(statusText).toHaveClass('text-green-600'); // Tema claro por padrão
      
      // Estado desconectado
      const disconnectedProps = generateProps({ isConnected: false });
      rerender(<Header {...disconnectedProps} />);
      
      statusText = screen.getByText('Desconectado');
      expect(statusText).toHaveClass('text-red-600'); // Tema claro por padrão
    });
  });

  // 3. Sistema de tema (Dark/Light mode)
  describe('Sistema de tema', () => {
    it('inicia com tema automático por padrão', () => {
      const props = generateProps();
      render(<Header {...props} />);

      const themeButton = screen.getByTitle('Modo atual: Automático - Clique para alternar');
      expect(themeButton).toBeInTheDocument();
      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('Auto')).toBeInTheDocument();
    });

    it('alterna entre os 3 modos de tema', () => {
      const props = generateProps();
      render(<Header {...props} />);

      const themeButton = screen.getByTitle('Modo atual: Automático - Clique para alternar');
      
      // Inicial: automático
      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('Auto')).toBeInTheDocument();
      
      // Clique 1: vai para claro
      fireEvent.click(themeButton);
      expect(screen.getByText('☀️')).toBeInTheDocument();
      expect(screen.queryByText('Auto')).not.toBeInTheDocument();
      
      // Clique 2: vai para escuro
      const newThemeButton = screen.getByTitle('Modo atual: Claro - Clique para alternar');
      fireEvent.click(newThemeButton);
      expect(screen.getByText('🌙')).toBeInTheDocument();
      
      // Clique 3: volta para automático
      const darkThemeButton = screen.getByTitle('Modo atual: Escuro - Clique para alternar');
      fireEvent.click(darkThemeButton);
      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('Auto')).toBeInTheDocument();
    });

    it('salva preferência no localStorage', () => {
      const props = generateProps();
      render(<Header {...props} />);

      let themeButton = screen.getByTitle('Modo atual: Automático - Clique para alternar');
      
      // Alterna para claro
      fireEvent.click(themeButton);
      expect(localStorage.getItem('theme')).toBe('light');
      
      // Alterna para escuro
      themeButton = screen.getByTitle('Modo atual: Claro - Clique para alternar');
      fireEvent.click(themeButton);
      expect(localStorage.getItem('theme')).toBe('dark');
      
      // Alterna para automático
      themeButton = screen.getByTitle('Modo atual: Escuro - Clique para alternar');
      fireEvent.click(themeButton);
      expect(localStorage.getItem('theme')).toBe('system');
    });

    it('carrega preferência salva do localStorage', () => {
      localStorage.setItem('theme', 'dark');
      
      const props = generateProps();
      render(<Header {...props} />);

      // Deve iniciar no modo escuro
      expect(screen.getByText('🌙')).toBeInTheDocument();
      expect(screen.queryByText('Auto')).not.toBeInTheDocument();
    });
  });

  // 4. Hook useDarkMode
  describe('Hook useDarkMode', () => {
    it('inicializa com valores padrão corretos', () => {
      render(<TestHookComponent />);

      expect(screen.getByTestId('isDarkMode')).toHaveTextContent('false');
      expect(screen.getByTestId('userPreference')).toHaveTextContent('system');
      expect(screen.getByTestId('isSystemDark')).toHaveTextContent('false');
    });

    it('detecta preferência do sistema corretamente', () => {
      // Mock para sistema dark
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      render(<TestHookComponent />);

      expect(screen.getByTestId('isSystemDark')).toHaveTextContent('true');
    });

    it('alterna temas corretamente através do hook', () => {
      render(<TestHookComponent />);

      const toggleButton = screen.getByTestId('toggleTheme');
      
      // Inicial: system
      expect(screen.getByTestId('userPreference')).toHaveTextContent('system');
      
      // Toggle 1: light
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('userPreference')).toHaveTextContent('light');
      
      // Toggle 2: dark
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('userPreference')).toHaveTextContent('dark');
      
      // Toggle 3: system
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('userPreference')).toHaveTextContent('system');
    });

    it('define tema específico através do hook', () => {
      render(<TestHookComponent />);

      const lightButton = screen.getByTestId('setLight');
      const darkButton = screen.getByTestId('setDark');
      
      // Define light
      fireEvent.click(lightButton);
      expect(screen.getByTestId('userPreference')).toHaveTextContent('light');
      expect(screen.getByTestId('isDarkMode')).toHaveTextContent('false');
      
      // Define dark
      fireEvent.click(darkButton);
      expect(screen.getByTestId('userPreference')).toHaveTextContent('dark');
      expect(screen.getByTestId('isDarkMode')).toHaveTextContent('true');
    });

    // it('escuta mudanças na preferência do sistema quando em modo automático', () => {
    //   let mediaQueryHandler: ((e: { matches: boolean }) => void) | null = null;
      
    //   const mockMediaQuery = {
    //     matches: false,
    //     addEventListener: jest.fn((type, handler) => {
    //       mediaQueryHandler = handler;
    //     }),
    //     removeEventListener: jest.fn(),
    //   };
      
    //   window.matchMedia = jest.fn().mockImplementation(() => mockMediaQuery);
      
    //   render(<TestHookComponent />);
      
    //   // Verifica se está escutando
    //   expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
    //   // Simula mudança no sistema
    //   act(() => {
    //     if (mediaQueryHandler) {
    //       mediaQueryHandler({ matches: true });
    //     }
    //   });
      
    //   expect(screen.getByTestId('isDarkMode')).toHaveTextContent('true');
    // });
  });

  // 5. Interações do usuário
  describe('Interações do usuário', () => {
    it('botão de tema tem tooltip correto para cada modo', () => {
      const props = generateProps();
      render(<Header {...props} />);

      let themeButton = screen.getByTitle('Modo atual: Automático - Clique para alternar');
      
      // Automático
      expect(themeButton).toHaveAttribute('title', 'Modo atual: Automático - Clique para alternar');
      
      // Claro
      fireEvent.click(themeButton);
      themeButton = screen.getByTitle('Modo atual: Claro - Clique para alternar');
      expect(themeButton).toHaveAttribute('title', 'Modo atual: Claro - Clique para alternar');
      
      // Escuro
      fireEvent.click(themeButton);
      themeButton = screen.getByTitle('Modo atual: Escuro - Clique para alternar');
      expect(themeButton).toHaveAttribute('title', 'Modo atual: Escuro - Clique para alternar');
    });

    it('botão de configurações está presente e clicável', () => {
      const props = generateProps();
      render(<Header {...props} />);

      const configButton = screen.getByText('⚙️');
      expect(configButton).toBeInTheDocument();
      expect(configButton.tagName).toBe('BUTTON');
      
      // Verifica se é clicável (não deve gerar erro)
      fireEvent.click(configButton);
    });

    it('aplica classes de hover e transição corretamente', () => {
      const props = generateProps();
      render(<Header {...props} />);

      const themeButton = screen.getByTitle('Modo atual: Automático - Clique para alternar');
      expect(themeButton).toHaveClass('transition-colors');
      expect(themeButton).toHaveClass('hover:bg-gray-300');
    });
  });
});
