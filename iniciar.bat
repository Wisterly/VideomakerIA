@echo off
title VideomakerI.A - Modo Aplicativo Nativo
color 0b

:: Fecha qualquer instância anterior para não acumular
echo Iniciando VideomakerI.A como Aplicativo Nativo...

:: Caminho para o Chrome ou Edge em modo App independente
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
set EDGE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set APP_HTML="%~dp0index.html"

:: Inicia o servidor local silenciosamente em segundo plano
start /b cmd /c "call npx.cmd serve "%~dp0" -l 3000 >nul 2>&1"
timeout /t 1 /nobreak >nul

:: Se o Chrome existir, abre como janela de aplicativo nativo (sem abas, sem barra de URL)
if exist %CHROME% (
    start "" %CHROME% --app="http://localhost:3000" --window-size=1280,820 --user-data-dir="%temp%\videomaker_ia_profile"
    goto fim
)

:: Caso contrário, usa o Edge nativo do Windows em modo aplicativo
if exist %EDGE% (
    start "" %EDGE% --app="http://localhost:3000" --window-size=1280,820 --user-data-dir="%temp%\videomaker_ia_profile"
    goto fim
)

:: Fallback se não encontrar os caminhos padrão
start "" "http://localhost:3000"

:fim
exit
