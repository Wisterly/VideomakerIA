# 🛡️ PONTOS DE RESTAURAÇÃO - VIDEOMAKER I.A

Registro histórico de versões e pontos de recuperação para segurança e rollback do projeto.

---

## 📋 REGRAS E DIRETRIZES DE CRIAÇÃO DOS PONTOS DE RECUPERAÇÃO

1. **Padrão Obrigatório de Nomenclatura Sequencial:**
   - O primeiro ponto de recuperação é sempre: `PR.000`
   - Os próximos pontos incrementam sequencialmente: `PR.001`, `PR.002`, `PR.003`, ..., `PR.999`.

2. **Gatilhos para Criação do Ponto (QUANDO CRIAR):**
   - ✅ **SEMPRE CRIAR:** Quando houver ordem explícita de execução, ajustes, modificações em arquivos, novas funcionalidades, alterações na linhagem de código, CSS, HTML, scripts, configurações ou formatações.

3. **Exceções (QUANDO NÃO CRIAR):**
   - ❌ **NUNCA CRIAR:** Quando o usuário fizer apenas perguntas, tirar dúvidas, pedir explicações conceituais, fazer brainstorming ou quando nenhuma linha de código ou arquivo do projeto for modificado.

---

## 📌 [PR.000] - START INICIAL DA ARQUITETURA
- **Data e Hora:** 21/10/2026 - 00:30
- **Identificador:** PR.000
- **Hash do Commit:** `cf0d40c` (Branch: `main`)
- **Repositório GitHub:** https://github.com/Wisterly/VideomakerIA
- **Deploy Vercel:** https://videomaker-ia.vercel.app
- **Ambiente:** Desktop App Nativo + PWA Mobile 24/7 (Vercel Ready)
- **Status:** 100% Configurado e Publicado no GitHub e na Vercel com CI/CD contínuo.

### 📦 O que foi criado e implementado:
1. **`BLUEPRINT.md`:** Mapeamento arquitetural completo, modelos IA (Seedance 2.5, Kling 1.5, Minimax, Luma) e diagnóstico de VRAM.
2. **`index.html` + `style.css` + `app.js`:** 
   - Estúdio visual completo em Dark Theme Cinematográfico.
   - Dropzone de upload com preview e verificação de imagem de referência.
   - Galeria interativa de estilos e prompts com mini-vídeos de pré-visualização ao passar o mouse.
   - Gatilhos rápidos de câmera (Slow motion, Dolly-in, Giro 360°, Vento natural, Golden hour).
   - Player com tela cheia, loop e download direto do `.mp4`.
3. **Modo Aplicativo Nativo no Desktop:**
   - `VideomakerIA.lnk` (Atalho executável de 1 clique).
   - `VideomakerIA.vbs` (Inicializador invisível sem tela preta de terminal).
   - `iniciar.bat` (Inicializador no modo `--app` sem barra de navegador ou abas).
4. **Infraestrutura PWA & Nuvem:**
   - `manifest.json` + `sw.js` (PWA para celular Android/iOS).
   - `vercel.json` + `.gitignore` (Deploy contínuo e roteamento na Vercel).
   - `package.json` + `README.md`.

### 🔄 Instruções de Rollback:
Caso qualquer alteração futura quebre o projeto, esta pasta inteira representa o estado inicial íntegro do ponto de recuperação `PR.000`.
