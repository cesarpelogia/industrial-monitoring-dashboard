'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConfigModal } from './ConfigModal';

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
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    return (
        <>
        <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 shadow px-4 sm:px-6 py-4 rounded-md mb-6 gap-4 sm:gap-0">
            {/* Lado esquerdo: Logo + Título */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="flex items-center space-x-3">
                    <Image 
                        src="/stw-logo.png" 
                        alt="STW Logo" 
                        width={96}
                        height={48}
                        className="object-contain w-16 h-8 sm:w-24 sm:h-12"
                        priority
                    />
                    <span className={`font-bold text-lg sm:text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Industrial Dashboard
                    </span>
                </div>
                <h1 className="text-base sm:text-lg font-semibold dark:text-white">Dashboard de Monitoramento</h1>
            </div>
    
            {/* Lado direito: TODOS os controles juntos */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* Status de Conexão */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
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
                    </div>
                    {/* Última atualização em linha separada no mobile */}
                    {lastUpdate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 block sm:inline">
                            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                        </span>
                    )}
                </div>
    
                {/* Controles - Toggle e Config */}
                <div className="flex items-center space-x-3">
                    {/* Toggle Dark/Light com 3 estados */}
                    <button
                        className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-3 py-2 rounded text-sm dark:text-white flex items-center space-x-2 transition-colors"
                        onClick={toggleTheme}
                        title={`Modo atual: ${userPreference === 'light' ? 'Claro' : userPreference === 'dark' ? 'Escuro' : 'Automático'} - Clique para alternar`}
                    >
                        <span className="text-base">
                            {userPreference === 'light' ? '☀️' : 
                             userPreference === 'dark' ? '🌙' : 
                             '🔄'}
                        </span>
                        {userPreference === 'system' && (
                            <span className="text-xs font-medium hidden sm:inline">Auto</span>
                        )}
                    </button>
        
                    {/* Configurações */}
                    <button 
                        onClick={() => setIsConfigOpen(true)}
                        className={`text-sm hover:underline ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        } p-2`}
                    >
                        ⚙️
                    </button>
                </div>
            </div>
        </header>
        
        {/* Modal de Configurações */}
        <ConfigModal 
            isOpen={isConfigOpen} 
            onClose={() => setIsConfigOpen(false)} 
        />
        </>
    );
}