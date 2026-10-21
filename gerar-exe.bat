@echo off
title VideomakerI.A - Gerador de Executavel (.exe)
color 0b
cls

echo ========================================================
echo       VIDEOMAKER I.A - COMPILADOR NATIVO (.EXE)
echo ========================================================
echo.
echo [1/3] Verificando dependencias necessarias...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Instale o Node.js em https://nodejs.org
    pause
    exit /b
)

echo [2/3] Instalando Electron e Electron-Builder (apenas na 1a vez)...
cmd.exe /c "npm install --save-dev electron electron-builder"

echo.
echo [3/3] Empacotando VideomakerIA para executavel portatil (.exe)...
cmd.exe /c "npm run dist"

echo.
if exist "dist\VideomakerIA 1.0.0.exe" (
    echo ========================================================
    echo  SUCESSO! O executavel foi gerado em:
    echo  dist\VideomakerIA 1.0.0.exe
    echo ========================================================
) else (
    echo Verifique o log acima na pasta dist\
)
echo.
pause
