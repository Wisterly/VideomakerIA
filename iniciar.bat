@echo off
title VideomakerI.A - Modo Aplicativo Nativo
color 0b

:: Garante diretorio raiz do projeto
cd /d "%~dp0"

echo Iniciando VideomakerI.A como Aplicativo Nativo...

:: Inicia o Servidor Unificado (Frontend + Motor IA GPU PyTorch CUDA) na porta 8000
set PYTHON="C:\Users\Lenovo\AppData\Local\Programs\Python\Python310\python.exe"
start /b "" %PYTHON% "%~dp0engine_gpu.py" >nul 2>&1

:: Aguarda o servidor subir
ping 127.0.0.1 -n 3 >nul

:: Abre no modo App nativo limpo na porta 8000 (Sem conflito de portas)
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
set EDGE="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist %CHROME% (
    start "" %CHROME% --app="http://127.0.0.1:8000" --window-size=1366,850 --user-data-dir="%temp%\videomaker_ia_profile"
    exit
)

if exist %EDGE% (
    start "" %EDGE% --app="http://127.0.0.1:8000" --window-size=1366,850 --user-data-dir="%temp%\videomaker_ia_profile"
    exit
)

start "" "http://127.0.0.1:8000"
exit
