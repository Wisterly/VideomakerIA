@echo off
title VideomakerI.A - Modo Aplicativo Nativo
color 0b

:: Garante diretorio do script
cd /d "%~dp0"

echo Iniciando VideomakerI.A como Aplicativo Nativo...

:: Inicia o motor de IA local GPU (FastAPI + PyTorch CUDA na porta 8000)
set PYTHON="C:\Users\Lenovo\AppData\Local\Programs\Python\Python310\python.exe"
if exist %PYTHON% (
    start /b "" %PYTHON% "%~dp0engine_gpu.py" >nul 2>&1
)

:: Inicia o servidor local silenciosamente em segundo plano
start /b cmd /c "call npx.cmd serve "%~dp0" -l 3000 >nul 2>&1"
timeout /t 2 /nobreak >nul

:: Abre no modo App nativo limpo
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
set EDGE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist %CHROME% (
    start "" %CHROME% --app="http://localhost:3000" --window-size=1366,850 --user-data-dir="%temp%\videomaker_ia_profile"
    exit
)

if exist %EDGE% (
    start "" %EDGE% --app="http://localhost:3000" --window-size=1366,850 --user-data-dir="%temp%\videomaker_ia_profile"
    exit
)

start "" "http://localhost:3000"
exit
