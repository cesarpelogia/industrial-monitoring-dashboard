@echo off
echo ========================================
echo  🏭 Industrial Monitoring Dashboard
echo ========================================
echo.
echo Iniciando o servidor de desenvolvimento...
echo.
cd /d "c:\Users\Win-10\Documents\STW\industrial-monitoring-dashboard\industrial-dashboard"
echo Executando: yarn dev --filter=web
echo.
yarn dev --filter=web
pause
