# 🔧 Troubleshooting - Dashboard Industrial

## Problemas Comuns e Soluções

### ❌ Erro: Hydration failed

**Sintoma**: Console mostra "Hydration failed because the server rendered text didn't match the client"

**Causa**: Dados dinâmicos (timestamps, random) diferem entre servidor e cliente

**✅ Solução Aplicada**:
- Hook `useIsClient()` previne renderização no servidor
- Estados inicializados com funções factory
- Loading skeleton durante hidratação
- LocalStorage carregado após mounted

### ❌ Erro: Turbopack no Windows

**Sintoma**: `leaves the filesystem root` ou path resolution errors

**✅ Solução Aplicada**:
- Removido `--turbopack` do script padrão
- Webpack configurado para Windows (`watchOptions`)
- Script alternativo `dev:turbo` disponível

### ❌ Erro: Cannot read properties of undefined

**Sintoma**: Erro ao executar comandos do terminal

**✅ Soluções**:
1. Execute diretamente: `cd apps/web && yarn dev`
2. Use o arquivo `start-dashboard.bat`
3. Reinicie o VS Code e tente novamente

### ❌ Erro: Port already in use

**Sintoma**: `EADDRINUSE: address already in use :::3000`

**✅ Soluções**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou use porta alternativa
yarn dev --port 3001
```

### ❌ Erro: Module not found

**Sintoma**: Não encontra módulos `@repo/ui` ou dependências

**✅ Soluções**:
```bash
# Limpe e reinstale
rm -rf node_modules
yarn install

# Ou force rebuild
yarn build --filter=ui
yarn dev --filter=web
```

### ❌ Erro: ESLint/TypeScript

**Sintoma**: Warnings de peer dependencies ou tipos

**✅ Soluções**:
```bash
# Instale dependências faltantes
yarn add @testing-library/dom react-is

# Ou ignore temporariamente
yarn dev --filter=web --ignore-warnings
```

## 🚀 Execução Garantida

### Método 1: Monorepo (Recomendado)
```bash
cd industrial-dashboard
yarn install
yarn dev --filter=web
```

### Método 2: App Individual
```bash
cd industrial-dashboard/apps/web
yarn install
yarn dev
```

### Método 3: Windows Batch
```bash
# Execute start-dashboard.bat na raiz
start-dashboard.bat
```

### Método 4: NPM Fallback
```bash
cd industrial-dashboard
npm install
npm run dev --filter=web
```

## 🔍 Verificação Rápida

✅ **Funcionando se você vê**:
- URL: http://localhost:3000
- Header com logo e navegação
- 4 cards de métricas
- Gráfico animado
- Lista de alertas
- Dados atualizando automaticamente

❌ **Problemas se você vê**:
- Página em branco
- Erro de hidratação no console
- Dados não atualizando
- Componentes não carregando

## 📞 Suporte Rápido

Se nada funcionar, execute para diagnóstico:

```bash
# Verificar ambiente
node --version  # Deve ser 18+
yarn --version  # Deve ser 4.x

# Verificar instalação
cd industrial-dashboard
ls -la  # Deve mostrar apps/ packages/
yarn install 2>&1 | tee install.log

# Teste individual
cd apps/web
yarn dev 2>&1 | tee dev.log
```

**Envie os logs**: `install.log` e `dev.log` para análise.
