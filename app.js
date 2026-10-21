// Catálogo de Prompts com Mini-vídeos de Exemplo
const PROMPT_PRESETS = [
  {
    id: 'portrait_smile',
    title: 'Retrato Cinematográfico',
    category: 'Pessoa / Retrato',
    prompt: 'Retrato cinematográfico em 4k. A pessoa olha diretamente para a câmera, pisca suavemente e dá um leve sorriso confiante. Iluminação suave de estúdio, vento sutil mexendo o cabelo, câmera lenta 60fps com dolly-in aproximando lentamente.',
    previewVideo: 'assets/previews/portrait_smile.mp4',
    poster: 'assets/previews/portrait_smile.jpg',
    badge: 'Seedance 2.5 Recomendado'
  },
  {
    id: 'golden_hour',
    title: 'Pôr do Sol & Brisa',
    category: 'Cenário / Emoção',
    prompt: 'Iluminação dourada de pôr do sol (Golden Hour). A pessoa vira o rosto lentamente em direção à luz solar, olhos brilhando com reflexos realistas. Câmera orbital sutil girando ao redor, profundidade de campo rasa com fundo desfocado bokeh.',
    previewVideo: 'assets/previews/golden_hour.mp4',
    poster: 'assets/previews/golden_hour.jpg',
    badge: 'Kling 1.5 Recomendado'
  },
  {
    id: 'cyberpunk_neon',
    title: 'Noite Urbana Neon',
    category: 'Estilo / Sci-Fi',
    prompt: 'Cenário noturno futurista com luzes neon azuis e magenta refletindo no rosto. A pessoa respira fundo enquanto gotas de chuva sutil caem em câmera lenta. Iluminação volumétrica dinâmica com névoa leve e foco nítido na expressão.',
    previewVideo: 'assets/previews/cyberpunk_neon.mp4',
    poster: 'assets/previews/cyberpunk_neon.jpg',
    badge: 'Luma Dream Machine'
  },
  {
    id: 'action_turn',
    title: 'Virada Dinâmica de Câmera',
    category: 'Movimento / Ação',
    prompt: 'A câmera começa em ângulo lateral e faz um movimento rápido e fluido de chicote (whip pan) parando na frente da pessoa. A pessoa ajusta a jaqueta com determinação, olhar focado e postura firme, 8k resolução, hiper-realista.',
    previewVideo: 'assets/previews/action_turn.mp4',
    poster: 'assets/previews/action_turn.jpg',
    badge: 'Minimax Hailuo'
  },
  {
    id: 'nature_wind',
    title: 'Natureza & Vento Forte',
    category: 'Ambiente Aberto',
    prompt: 'Ambiente montanhoso ao ar livre. Vento intenso agitando o cabelo e as roupas com física precisa e realista. A pessoa semicerra os olhos contra a luz do dia e olha para o horizonte, lente grande-angular cinematográfica.',
    previewVideo: 'assets/previews/nature_wind.mp4',
    poster: 'assets/previews/nature_wind.jpg',
    badge: 'Seedance 2.5 Recomendado'
  }
];

// Estado da Aplicação
let currentEngineMode = localStorage.getItem('videomaker_engine_mode') || 'cloud'; // 'cloud' (Opção B) ou 'local' (Opção A)
let selectedModel = 'seedance';
let uploadedImageBase64 = null;
let deferredPrompt = null;
const videoHistory = [];

// Inicialização do DOM
document.addEventListener('DOMContentLoaded', () => {
  initPresetsGallery();
  initUploadDropzone();
  initModeToggle();
  initModelSelector();
  initTags();
  initSettingsModal();
  initPWA();
  initGenerationEngine();
});

// Toggle entre Opção A (Local GPU) e Opção B (Nuvem / APIs)
function initModeToggle() {
  const btnCloud = document.getElementById('btn-mode-cloud');
  const btnLocal = document.getElementById('btn-mode-local');

  function updateModeUI(mode) {
    currentEngineMode = mode;
    localStorage.setItem('videomaker_engine_mode', mode);

    if (mode === 'cloud') {
      btnCloud.classList.add('active');
      btnLocal.classList.remove('active');
    } else {
      btnLocal.classList.add('active');
      btnCloud.classList.remove('active');
    }
  }

  if (btnCloud && btnLocal) {
    btnCloud.addEventListener('click', () => updateModeUI('cloud'));
    btnLocal.addEventListener('click', () => updateModeUI('local'));
    updateModeUI(currentEngineMode);
  }
}

// 1. Renderiza a Galeria de Prompts com Mini-Vídeos
function initPresetsGallery() {
  const container = document.getElementById('presets-container');
  if (!container) return;

  container.innerHTML = PROMPT_PRESETS.map(preset => `
    <div class="preset-card" onclick="applyPreset('${preset.id}')">
      <div class="preset-video-wrapper">
        <video 
          src="${preset.previewVideo}" 
          poster="${preset.poster}" 
          muted 
          loop 
          playsinline 
          preload="metadata"
          onmouseenter="playPreviewVideo(this)" 
          onmouseleave="pausePreviewVideo(this)">
        </video>
        <span class="preset-hover-hint">▶ Passe o mouse</span>
      </div>
      <div class="preset-info">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong class="preset-title">${preset.title}</strong>
        </div>
        <span class="preset-badge">${preset.badge}</span>
        <p class="preset-desc">${preset.prompt.substring(0, 75)}...</p>
      </div>
    </div>
  `).join('');
}

function playPreviewVideo(videoEl) {
  if (videoEl) {
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }
}

function pausePreviewVideo(videoEl) {
  if (videoEl) {
    videoEl.pause();
    videoEl.currentTime = 0;
  }
}

// Aplica o prompt clicado diretamente no formulário
window.applyPreset = function(id) {
  const preset = PROMPT_PRESETS.find(p => p.id === id);
  if (!preset) return;

  const promptInput = document.getElementById('prompt-input');
  promptInput.value = preset.prompt;
  promptInput.focus();
  
  // Feedback visual no card selecionado
  document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
};

// 2. Dropzone & Upload de Imagem
function initUploadDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('image-preview');
  const overlay = document.getElementById('upload-overlay');
  const dropzoneText = document.getElementById('dropzone-text');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImage(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImage(e.target.files[0]);
    }
  });

  function handleImage(file) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageBase64 = e.target.result;
      preview.src = uploadedImageBase64;
      preview.style.display = 'block';
      overlay.style.display = 'block';
      dropzoneText.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

// 3. Seletor de Modelo
function initModelSelector() {
  const cards = document.querySelectorAll('.model-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedModel = card.dataset.model;
    });
  });
}

// 4. Tags Rápidas
function initTags() {
  const tags = document.querySelectorAll('.tag-btn');
  const promptInput = document.getElementById('prompt-input');

  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      const tagText = tag.dataset.tag;
      if (promptInput.value.trim() === '') {
        promptInput.value = tagText;
      } else {
        promptInput.value += `, ${tagText}`;
      }
      promptInput.focus();
    });
  });
}

// 5. Configuração e Chave de API (Opção B)
function initSettingsModal() {
  const modal = document.getElementById('modal-settings');
  const btnOpen = document.getElementById('btn-open-settings');
  const btnClose = document.getElementById('btn-close-modal');
  const btnSave = document.getElementById('btn-save-key');
  const keyInput = document.getElementById('api-key-input');
  const providerSelect = document.getElementById('api-provider-select');

  const savedKey = localStorage.getItem('ai_video_api_key') || '';
  const savedProvider = localStorage.getItem('ai_video_provider') || 'fal';

  keyInput.value = savedKey;
  if (providerSelect) providerSelect.value = savedProvider;

  btnOpen.addEventListener('click', () => modal.style.display = 'flex');
  btnClose.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  btnSave.addEventListener('click', () => {
    const key = keyInput.value.trim();
    const provider = providerSelect ? providerSelect.value : 'fal';
    
    localStorage.setItem('ai_video_api_key', key);
    localStorage.setItem('ai_video_provider', provider);
    
    // Automaticamente migra e ativa o modo nuvem (Opção B)
    if (key) {
      currentEngineMode = 'cloud';
      localStorage.setItem('videomaker_engine_mode', 'cloud');
      const btnCloud = document.getElementById('btn-mode-cloud');
      const btnLocal = document.getElementById('btn-mode-local');
      if (btnCloud && btnLocal) {
        btnCloud.classList.add('active');
        btnLocal.classList.remove('active');
      }
    }

    modal.style.display = 'none';
    alert(`Opção B Ativada! Provedor [${provider.toUpperCase()}] configurado com sucesso!`);
  });
}

// 6. Motor de Geração de Vídeo
function initGenerationEngine() {
  const btnGenerate = document.getElementById('btn-generate');
  const stageEmpty = document.getElementById('stage-empty');
  const stageLoading = document.getElementById('stage-loading');
  const stageVideo = document.getElementById('stage-video');
  const videoActions = document.getElementById('video-actions');
  const btnDownload = document.getElementById('btn-download-video');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const promptInput = document.getElementById('prompt-input');

  btnFullscreen.addEventListener('click', () => {
    if (stageVideo.requestFullscreen) {
      stageVideo.requestFullscreen();
    }
  });

  btnGenerate.addEventListener('click', async () => {
    const promptText = promptInput.value.trim();

    if (!uploadedImageBase64) {
      alert('⚠️ Por favor, faça o upload de uma foto de referência antes de gerar o vídeo!');
      return;
    }

    if (!promptText) {
      alert('⚠️ Por favor, descreva o roteiro do vídeo ou selecione um prompt da galeria!');
      return;
    }

    // Exibe estado de carregamento no Player
    stageEmpty.style.display = 'none';
    stageVideo.style.display = 'none';
    videoActions.style.display = 'none';
    stageLoading.style.display = 'flex';
    btnGenerate.disabled = true;

    try {
      let resultVideoUrl = '';

      // ROTA 1: OPÇÃO B (Nuvem / APIs de Alta Resolução: Fal.ai, Replicate, HF)
      if (currentEngineMode === 'cloud') {
        const apiKey = localStorage.getItem('ai_video_api_key');
        const provider = localStorage.getItem('ai_video_provider') || 'fal';

        if (!apiKey) {
          // Abre o modal para o usuário inserir a chave se ainda não inseriu
          document.getElementById('modal-settings').style.display = 'flex';
          throw new Error('Você está no modo Opção B (Nuvem). Por favor, insira sua chave de API (Fal.ai ou Replicate) para disparar a IA externa!');
        }

        resultVideoUrl = await requestCloudVideo(apiKey, uploadedImageBase64, promptText, selectedModel, provider);
      } 
      // ROTA 2: OPÇÃO A (GPU Local com PyTorch CUDA)
      else {
        try {
          const localRes = await fetch('http://127.0.0.1:8000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_base64: uploadedImageBase64,
              prompt: promptText,
              model: selectedModel,
              num_frames: 90,
              fps: 30
            })
          });

          if (localRes.ok) {
            const data = await localRes.json();
            resultVideoUrl = data.video_base64;
            console.log(`✓ Vídeo gerado via GPU Local (${data.device}) em ${data.elapsed_seconds}s!`);
          } else {
            const errDetail = await localRes.text();
            throw new Error(`Falha no motor local: ${errDetail}`);
          }
        } catch (localErr) {
          throw new Error('O motor local da GPU não respondeu na porta 8000. Inicie pelo atalho da Área de Trabalho ou mude para a "Opção B (Nuvem)" no topo!');
        }
      }

      // Sucesso na Renderização
      stageLoading.style.display = 'none';
      stageVideo.src = resultVideoUrl;
      stageVideo.style.display = 'block';
      videoActions.style.display = 'flex';

      // Configuração robusta de download de arquivo local (.mp4)
      btnDownload.onclick = () => {
        downloadBase64Video(resultVideoUrl, `VideomakerIA_${Date.now()}.mp4`);
      };

      // Adiciona ao histórico
      addToHistory(resultVideoUrl, promptText, selectedModel);

    } catch (error) {
      stageLoading.style.display = 'none';
      stageEmpty.style.display = 'flex';
      alert('Erro na renderização: ' + error.message);
    } finally {
      btnGenerate.disabled = false;
    }
  });
}

// Função universal para download de vídeo em base64 ou blob
function downloadBase64Video(base64Data, filename) {
  try {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'video/mp4';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);

    const tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.download = filename;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();

    setTimeout(() => {
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (err) {
    console.error('Erro no download:', err);
    // Fallback direto
    const tempLink = document.createElement('a');
    tempLink.href = base64Data;
    tempLink.download = filename;
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
  }
}

// Chamada para APIs de Nuvem (Opção B: Fal.ai, Replicate, etc)
async function requestCloudVideo(apiKey, imageBase64, prompt, model, provider = 'fal') {
  const statusEl = document.getElementById('loader-status');
  if (statusEl) statusEl.innerText = `Enviando requisição para ${provider.toUpperCase()} (${model.toUpperCase()})...`;

  if (provider === 'fal') {
    // Mapeamento dos endpoints no Fal.ai
    let endpoint = 'fal-ai/kling-video/v1/standard/image-to-video';
    if (model === 'luma') endpoint = 'fal-ai/luma-dream-machine/image-to-video';
    else if (model === 'minimax') endpoint = 'fal-ai/minimax-video/image-to-video';
    else if (model === 'seedance') endpoint = 'fal-ai/kling-video/v1.5/pro/image-to-video';

    const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: imageBase64
      })
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      throw new Error(`Fal.ai erro HTTP ${submitRes.status}: ${err}`);
    }

    const submitData = await submitRes.json();
    const requestId = submitData.request_id;
    const statusUrl = submitData.status_url || `https://queue.fal.run/${endpoint}/requests/${requestId}/status`;
    const responseUrl = submitData.response_url || `https://queue.fal.run/${endpoint}/requests/${requestId}`;

    // Polling de status do vídeo na nuvem
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 4000));
      if (statusEl) statusEl.innerText = `Renderizando vídeo cinematográfico na Nuvem... (${(i + 1) * 4}s)`;

      const pollRes = await fetch(statusUrl, {
        headers: { 'Authorization': `Key ${apiKey}` }
      });
      const pollData = await pollRes.json();

      if (pollData.status === 'COMPLETED') {
        const finalRes = await fetch(responseUrl, {
          headers: { 'Authorization': `Key ${apiKey}` }
        });
        const finalData = await finalRes.json();
        const videoObj = finalData.video || finalData.video_url || finalData.output;
        return typeof videoObj === 'string' ? videoObj : (videoObj.url || '');
      } else if (pollData.status === 'FAILED') {
        throw new Error(`Falha no processamento da nuvem: ${JSON.stringify(pollData.error || pollData)}`);
      }
    }
    throw new Error('Tempo limite excedido na nuvem (Timeout após 4 minutos).');
  } 
  
  else if (provider === 'replicate') {
    // Replicate direct model invocation
    const submitRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "3f04d474d1a42fa0b731f358add0505757f315a6194537da9e517d69932cb0fa",
        input: {
          input_image: imageBase64,
          prompt: prompt
        }
      })
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      throw new Error(`Replicate erro HTTP ${submitRes.status}: ${err}`);
    }

    const pred = await submitRes.json();
    const getUrl = pred.urls.get;

    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 4000));
      if (statusEl) statusEl.innerText = `Processando no Replicate... (${(i + 1) * 4}s)`;

      const pollRes = await fetch(getUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded') {
        return Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
      } else if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error(`Replicate falhou: ${pollData.error}`);
      }
    }
    throw new Error('Tempo limite excedido no Replicate.');
  }

  throw new Error(`Provedor [${provider}] não implementado.`);
}

// Histórico de Vídeos Gerados
function addToHistory(videoUrl, prompt, model) {
  const historyList = document.getElementById('history-list');
  const noHistoryText = document.getElementById('no-history-text');
  if (noHistoryText) noHistoryText.remove();

  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `
    <video src="${videoUrl}" muted loop></video>
    <div class="history-item-info">
      <strong>${model.toUpperCase()}</strong>
      <p>${prompt.substring(0, 45)}...</p>
    </div>
  `;
  item.addEventListener('click', () => {
    const stageVideo = document.getElementById('stage-video');
    stageVideo.src = videoUrl;
    stageVideo.play();
  });

  historyList.prepend(item);
}

// 7. Configuração PWA (Instalar App no Celular e PC)
function initPWA() {
  const installBtn = document.getElementById('btn-pwa-install');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installBtn.style.display = 'none';
    }
    deferredPrompt = null;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration failed:', err);
      });
    });
  }
}
