# 🏭 Industrial Monitoring Dashboard

**Desafio Técnico**: Dashboard de Automação Industrial para monitoramento em tempo real de linha de produção.

> Sistema focado no monitoramento de **equipamento misturador** com visibilidade completa sobre estado da máquina, métricas de performance e alertas operacionais.

## 🚀 Execução:

```bash
# 1. Clone e acesse
git clone https://github.com/cesarpelogia/industrial-monitoring-dashboard.git
cd industrial-monitoring-dashboard/industrial-dashboard

# 2. Instale e execute
yarn install
yarn dev --filter=web

# 3. Acesse: http://localhost:3000
```

### 🪟 **Windows**: Se houver problemas, use `start-dashboard.bat` ou [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## ✅ Conformidade com Requisitos (100%)

### Stack Técnico Obrigatório
- ✅ **Next.js 14+** com App Router
- ✅ **TypeScript 100%** (zero arquivos .js)
- ✅ **Tailwind CSS** com dark mode
- ✅ **Monorepo Turborepo** funcional
- ✅ **Recharts** para gráficos
- ✅ **Jest + Testing Library** com cobertura completa

### Funcionalidades Obrigatórias
- ✅ **Monitoramento Tempo Real**: Estados RUNNING/STOPPED/MAINTENANCE/ERROR
- ✅ **Visualização**: Cards + gráficos + interface responsiva
- ✅ **Sistema Alertas**: INFO/WARNING/CRITICAL + acknowledgment
- ✅ **Métricas OEE**: Disponibilidade × Performance × Qualidade

### Diferenciais Implementados
- ✅ **Dark Mode**: 3 estados (light/dark/auto)
- ✅ **Configurações**: Intervalo ajustável (2-10s) + persistência
- ✅ **Simulação Realística**: Dados industriais com padrões realistas
- ✅ **Componentização**: 8 componentes + hooks + tipos

## 🎯 Interface do Dashboard

**URL**: http://localhost:3000

### Funcionalidades
- **🏭 Header**: Logo STW + título + status conexão + dark/light + configurações
- **📊 Cards**: Estado máquina + temperatura + RPM + tempo operação  
- **📈 Gráfico**: Histórico tempo real temperatura/RPM com Recharts
- **🚨 Alertas**: Lista com níveis INFO/WARNING/CRITICAL + acknowledgment
- **📐 OEE**: Métricas industriais (Disponibilidade × Performance × Qualidade)
- **🔄 Dados**: Auto-atualização a cada 3s (configurável 2-10s via modal ⚙️)

## 🧪 Suíte de Testes

**Cobertura Completa**: 7 arquivos de teste validando todos os componentes críticos

```bash
# Executar todos os testes
yarn test

# Com coverage
yarn test --coverage
```

### Componentes Testados
- ✅ **Header.tsx**: Logo, responsividade, dark mode toggle
- ✅ **AlertList.tsx**: Renderização alertas, acknowledgment, filtros
- ✅ **ChartPanel.tsx**: Gráficos Recharts, dados tempo real
- ✅ **ConnectionStatus.tsx**: Estados conexão, indicadores visuais
- ✅ **Efficiency.tsx**: Cálculos OEE, métricas industriais
- ✅ **MachineStatusCard.tsx**: Estados máquina, temperaturas
- ✅ **MetricCard.tsx**: Formatação valores, trends, unidades

**Framework**: Jest + React Testing Library + TypeScript

## 📁 Estrutura do Código

```
industrial-dashboard/                    # Monorepo Turborepo
├── apps/web/                           # Dashboard principal Next.js 14
│   ├── app/page.tsx                    # Página principal
│   └── public/stw-logo.png            # Logo da empresa
└── packages/ui/                       # Biblioteca de componentes
    ├── components/                     # 8 componentes React
    │   ├── Header.tsx                 # Header com logo STW
    │   ├── ChartPanel.tsx             # Gráficos Recharts
    │   ├── AlertList.tsx              # Sistema de alertas
    │   ├── ConfigModal.tsx            # Modal configurações
    │   └── __tests__/                 # 7 arquivos de teste Jest
    ├── hooks/                         # 3 hooks customizados
    ├── lib/dataSimulator.ts           # Simulador industrial (324 linhas)
    └── types/index.ts                 # Interfaces TypeScript
```

## 📊 Dados Simulados (Industrial)

```typescript
// Equipamento: Misturador Industrial MIXER_001
{
  state: "RUNNING" | "STOPPED" | "MAINTENANCE" | "ERROR",
  metrics: {
    temperature: 75,    // 65-90°C com variações ±1.5°C
    rpm: 1200,         // 800-1600 com variações ±25 RPM  
    uptime: 142,       // Minutos contínuos
    efficiency: 92     // 70-100% calculado
  },
  oee: {
    overall: 92,       // Disponibilidade × Performance × Qualidade
    availability: 98,  // Uptime vs tempo total
    performance: 95,   // RPM atual vs 1400 ideal
    quality: 94        // Desvio temperatura vs 75°C ideal
  }
}
```

---

**🎯 Status**: 100% funcional  
**🚀 Demo**: `yarn dev --filter=web`
