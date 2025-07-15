import { useState, useEffect, useCallback, useRef } from 'react'
import { dataSimulator } from '../lib/dataSimulator'
import type { MachineStatus, MetricHistory } from '../types/index'

interface UseRealTimeDataOptions {
  interval?: number // Intervalo em millisegundos (padrão: 3000ms)
  maxDataPoints?: number // Máximo de pontos de dados a manter (padrão: 50)
  enabled?: boolean // Se a atualização está habilitada (padrão: true)
}

interface UseRealTimeDataReturn {
  data: MetricHistory[]
  machineStatus: MachineStatus | null
  isConnected: boolean
  lastUpdate: Date | null
  startUpdates: () => void
  stopUpdates: () => void
  clearData: () => void
}

/**
 * Hook para gerenciar dados em tempo real com simulação
 * @param options Opções de configuração
 * @returns Objeto com dados e funções de controle
 */
export function useRealTimeData(options: UseRealTimeDataOptions = {}): UseRealTimeDataReturn {
  const {
    interval = 3000,
    maxDataPoints = 50,
    enabled = true
  } = options

  const [data, setData] = useState<MetricHistory[]>([])
  const [machineStatus, setMachineStatus] = useState<MachineStatus | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const enabledRef = useRef(enabled)

  // Atualiza a referência quando enabled muda
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  // Função para atualizar dados do simulador
  const updateData = useCallback(() => {
    if (!enabledRef.current) return
    
    try {
      const status = dataSimulator.getCurrentStatus()
      const history = dataSimulator.getHistory()
      
      setMachineStatus(status)
      setData(history.slice(-maxDataPoints))
      setLastUpdate(new Date())
      setIsConnected(dataSimulator.getConnectionStatus().isConnected)
    } catch (error) {
      console.warn('Erro ao atualizar dados em tempo real:', error)
      setIsConnected(false)
    }
  }, [maxDataPoints])

  // Função para iniciar as atualizações
  const startUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsConnected(true)
    
    // Atualiza dados imediatamente
    updateData()
    
    // Configura o intervalo para atualizações contínuas
    intervalRef.current = setInterval(updateData, interval)
  }, [updateData, interval])

  // Função para parar as atualizações
  const stopUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Função para limpar todos os dados
  const clearData = useCallback(() => {
    setData([])
    setMachineStatus(null)
    setLastUpdate(null)
  }, [])

  // Efeito para inicializar as atualizações se enabled for true
  useEffect(() => {
    if (enabled) {
      startUpdates()
    } else {
      stopUpdates()
    }

    // Cleanup ao desmontar o componente
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, startUpdates, stopUpdates])

  // Efeito para atualizar o intervalo quando ele muda
  useEffect(() => {
    if (isConnected && enabled) {
      stopUpdates()
      startUpdates()
    }
  }, [interval, isConnected, enabled, startUpdates, stopUpdates])

  return {
    data,
    machineStatus,
    isConnected,
    lastUpdate,
    startUpdates,
    stopUpdates,
    clearData
  }
}
