import { useState, useEffect } from 'react';

/**
 * Utilitários para formatação de datas SSR-safe
 * Evita problemas de hidratação entre servidor e cliente
 */

/**
 * Formata timestamp de forma relativa, com fallback para formato absoluto durante SSR
 * @param date Data a ser formatada
 * @param isClient Flag indicando se está executando no cliente
 * @returns String formatada
 */
export function formatRelativeTime(date: Date, isClient: boolean = true): string {
  // Durante SSR, sempre mostrar formato absoluto para evitar hidratação
  if (!isClient) {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // No cliente, mostrar formato relativo
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata timestamp para formato absoluto
 * @param date Data a ser formatada
 * @returns String formatada
 */
export function formatAbsoluteTime(date: Date): string {
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata timestamp curto (para componentes como ConnectionStatus)
 * @param date Data a ser formatada
 * @param isClient Flag indicando se está executando no cliente
 * @returns String formatada
 */
export function formatShortRelativeTime(date: Date, isClient: boolean = true): string {
  // Durante SSR, sempre mostrar formato absoluto para evitar hidratação
  if (!isClient) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // No cliente, mostrar formato relativo
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 10) return 'agora';
  if (diffSecs < 60) return `${diffSecs}s atrás`;
  if (diffMins < 60) return `${diffMins}min atrás`;
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Hook personalizado para detectar se está executando no cliente
 * Evita problemas de hidratação
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
