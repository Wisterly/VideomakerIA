# 🎬 BLUEPRINT TÉCNICO - VideomakerI.A (AI Video Studio)

## 1. Visão Geral do Projeto
O **VideomakerI.A** é um estúdio de geração e animação de vídeos cinematográficos por Inteligência Artificial baseado em arquitetura **Image-to-Video (I2V)** e **Text-to-Video (T2V)**. O usuário fornece uma foto de referência de uma pessoa ou cenário, configura o roteiro/prompt de movimento e a aplicação gera o vídeo com alta fidelidade de identidade e física realista.

O projeto é construído em arquitetura **100% Client-Side / Portátil e PWA**, podendo ser executado:
1. **Localmente:** Através de um arquivo `iniciar.bat` no Windows (acessando via `localhost`).
2. **Na Nuvem / Vercel:** Deploy direto via GitHub com suporte a HTTPS e funcionamento 24/7.
3. **No Celular (Mobile):** Instalável como aplicativo nativo (PWA) no Android e iOS ou acessível via navegador.

---

## 2. Diagnóstico de Hardware e Decisão de Engenharia
- **GPU Detectada:** NVIDIA GeForce RTX 4050 Laptop (6 GB VRAM).
- **Limitação de VRAM:** Modelos como HunyuanVideo, CogVideoX e Sora exigem entre 16 GB e 24 GB de VRAM dedicada para não causar `CUDA Out of Memory`.
- **Estratégia Adotada:** 
  - **Interface & Orquestração:** 100% Client-side (zero consumo de VRAM da máquina local).
  - **Motor de Renderização:** Conexão direta via API com os modelos líderes mundiais (**Seedance 2.0 / 2.5 da ByteDance**, **Kling 1.5**, **Minimax Hailuo**, **Luma Dream Machine** e **Runway Gen-3** através de endpoints seguros como Fal.ai / Replicate).
  - **Segurança de Credenciais:** As chaves de API ficam salvas de forma segura no `localStorage` do navegador do usuário, sem expor tokens em repositórios públicos do GitHub ou na Vercel.

---

## 3. Matriz de Funcionalidades do VideomakerI.A
1. **Upload & Crop de Referência:**
   - Upload de foto em alta definição (JPG, PNG, WEBP).
   - Preview instantâneo com verificação de enquadramento facial.
2. **Seletor de Modelos de IA:**
   - **ByteDance Seedance 2.5 / 2.0:** Máxima consistência de identidade e expressões faciais.
   - **Kling AI 1.5:** Realismo cinematográfico e movimentos complexos.
   - **Minimax Hailuo:** Física fluida e renderização ultrarrápida.
   - **Luma Dream Machine:** Transições dramáticas e iluminação realista.
3. **Prompt Builder Inteligente (Engenharia de Prompt para I2V):**
   - Guias rápidos para movimentos de câmera: *Dolly-in*, *Pan lateral*, *Slow-motion*, *Orbital 360°*.
   - Expressões e Física: *Piscar suave*, *Sorriso natural*, *Vento no cabelo*, *Respiração suave*.
   - Bloqueio de artefatos (Negative prompt interno para evitar aberrações).
4. **Player de Vídeo Integrado & Histórico:**
   - Player com controles de reprodução, loop e tela cheia.
   - Botão de download direto do arquivo `.mp4` em Full HD.
   - Histórico local de vídeos gerados (salvo no cache/IndexedDB do navegador).
5. **Configuração PWA (Mobile Ready):**
   - Suporte a instalação como App no Chrome do celular e no Windows.
   - `manifest.json` com ícones e cores configuradas.
   - `sw.js` (Service Worker) para cache e carregamento instantâneo.

---

## 4. Estrutura de Arquivos da Aplicação
```
C:\Users\Lenovo\Documents\antigravity\VideomakerI.A\
├── index.html            # Interface moderna estilo estúdio (Dark Theme cinematográfico)
├── app.js                # Lógica de upload, construção de prompt, chamadas de API e player
├── style.css             # Estilização CSS responsiva e premium com microinterações
├── manifest.json         # Manifesto PWA para instalação no celular e desktop
├── sw.js                 # Service Worker para funcionalidade offline e PWA
├── vercel.json           # Configuração de rotas para deploy na Vercel
├── .gitignore            # Arquivos ignorados para o Git / GitHub
├── package.json          # Metadados e scripts do projeto
├── iniciar.bat           # Executável portátil para inicializar o host local com 1 clique
└── README.md             # Instruções completas de uso local, GitHub e Vercel
```
