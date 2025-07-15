'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
  // Estado interno: preferência do usuário
  const [userPreference, setUserPreference] = useState<Theme>('system');
  
  // Estado computado: dark mode ativo ou não
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Flag para evitar flash durante hidratação
  const [isInitialized, setIsInitialized] = useState(false);

  // Detecta preferência do sistema
  const getSystemPreference = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Inicialização - le do localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('theme') as Theme;
    if (savedPreference && ['light', 'dark', 'system'].includes(savedPreference)) {
      setUserPreference(savedPreference);
    } else {
      setUserPreference('system');
    }
    setIsInitialized(true);
  }, []);

  // Calcula se deve estar dark baseado na preferência
  useEffect(() => {
    if (!isInitialized) return; // Aguarda inicialização
    
    const calculateDarkMode = () => {
      switch (userPreference) {
        case 'dark': {
          return true;
        }
        case 'light': {
          return false;
        }
        case 'system':
        default: {
          const systemPref = getSystemPreference();
          return systemPref;
        }
      }
    };

    const newDarkMode = calculateDarkMode();
    setIsDarkMode(newDarkMode);

    // Escuta mudanças na preferência do sistema APENAS se for modo system
    if (userPreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setIsDarkMode(mediaQuery.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [userPreference, isInitialized]);

  // Aplica a classe no HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Função para o usuário alternar
  const toggleTheme = () => {
    const newPreference: Theme = 
      userPreference === 'light' ? 'dark' :
      userPreference === 'dark' ? 'system' :
      'light';
    
    setUserPreference(newPreference);
    localStorage.setItem('theme', newPreference);
  };

  // Função para escolher tema específico
  const setTheme = (theme: Theme) => {
    setUserPreference(theme);
    localStorage.setItem('theme', theme);
  };

  return {
    isDarkMode,
    userPreference,
    toggleTheme,
    setTheme,
    isSystemDark: getSystemPreference()
  };
}

export interface HeaderProps {
  isConnected: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  lastUpdate?: Date;
}

export function Header({ isConnected,lastUpdate }: Omit<HeaderProps, 'isDarkMode' | 'onToggleDarkMode'>) {

    const { isDarkMode, userPreference, toggleTheme } = useDarkMode();

    return (
        <header className="w-full flex items-center justify-between bg-white dark:bg-gray-800 shadow px-6 py-4 rounded-md mb-6">
            {/* Lado esquerdo: Logo + Título */}
            <div className="flex items-center space-x-4">
                <span className={`font-bold text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    🏭 Industrial Dashboard
                </span>
                <h1 className="text-lg font-semibold dark:text-white">Dashboard de Monitoramento</h1>
            </div>
    
            {/* Lado direito: TODOS os controles juntos */}
            <div className="flex items-center space-x-4">
                {/* Status de Conexão */}
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                        isConnected 
                            ? (isDarkMode ? 'text-green-400' : 'text-green-600') 
                            : (isDarkMode ? 'text-red-400' : 'text-red-600')
                    }`}>
                        {isConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                                        {/* Adicionar depois do status de conexão: */}
                    {lastUpdate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                        </span>
                    )}
                </div>
    
                {/* Toggle Dark/Light com 3 estados */}
                <button
                    className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-3 py-2 rounded text-sm dark:text-white flex items-center space-x-2 transition-colors"
                    onClick={toggleTheme}
                    title={`Modo atual: ${userPreference === 'light' ? 'Claro' : userPreference === 'dark' ? 'Escuro' : 'Automático'} - Clique para alternar`}
                >
                    <span className="text-lg">
                        {userPreference === 'light' ? '☀️' : 
                         userPreference === 'dark' ? '🌙' : 
                         '🔄'}
                    </span>
                    {userPreference === 'system' && (
                        <span className="text-xs font-medium">Auto</span>
                    )}
                </button>
    
                {/* Configurações */}
                <button className={`text-sm hover:underline ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                    ⚙️
                </button>
            </div>
        </header>
    );
}