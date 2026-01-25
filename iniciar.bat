@echo off
chcp 65001 >nul
cd /d "c:\Users\Guilherme Martins\Desktop\PJ NOVO"

echo.
echo ===============================================
echo  Instalando Nossas Finanças - Servidor
echo ===============================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.
echo 📦 Instalando dependências...
echo.

call npm install

echo.
echo ===============================================
echo ✅ Instalação concluída!
echo ===============================================
echo.
echo 🚀 Iniciando servidor...
echo.
echo 📍 URL de Teste: http://localhost:3000/test
echo 🎉 Servidor rodando na porta 3000
echo.

call npm start

pause
