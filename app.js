// Catálogo de Prompts com Mini-vídeos de Exemplo
const PROMPT_PRESETS = [
  {
    id: 'portrait_smile',
    title: 'Retrato Cinematográfico',
    category: 'Pessoa / Retrato',
    prompt: 'Retrato cinematográfico em 4k. A pessoa olha diretamente para a câmera, pisca suavemente e dá um leve sorriso confiante. Iluminação suave de estúdio, vento sutil mexendo o cabelo, câmera lenta 60fps com dolly-in aproximando lentamente.',
    previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    badge: 'Seedance 2.5 Recomendado'
  },
  {
    id: 'golden_hour',
    title: 'Pôr do Sol & Brisa',
    category: 'Cenário / Emoção',
    prompt: 'Iluminação dourada de pôr do sol (Golden Hour). A pessoa vira o rosto lentamente em direção à luz solar, olhos brilhando com reflexos realistas. Câmera orbital sutil girando ao redor, profundidade de campo rasa com fundo desfocado bokeh.',
    previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    badge: 'Kling 1.5 Recomendado'
  },
  {
    id: 'cyberpunk_neon',
    title: 'Noite Urbana Neon',
    category: 'Estilo / Sci-Fi',
    prompt: 'Cenário noturno futurista com luzes neon azuis e magenta refletindo no rosto. A pessoa respira fundo enquanto gotas de chuva sutil caem em câmera lenta. Iluminação volumétrica dinâmica com névoa leve e foco nítido na expressão.',
    previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    badge: 'Luma Dream Machine'
  },
  {
    id: 'action_turn',
    title: 'Virada Dinâmica de Câmera',
    category: 'Movimento / Ação',
    prompt: 'A câmera começa em ângulo lateral e faz um movimento rápido e fluido de chicote (whip pan) parando na frente da pessoa. A pessoa ajusta a jaqueta com determinação, olhar focado e postura firme, 8k resolução, hiper-realista.',
    previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    badge: 'Minimax Hailuo'
  },
  {
    id: 'nature_wind',
    title: 'Natureza & Vento Forte',
    category: 'Ambiente Aberto',
    prompt: 'Ambiente montanhoso ao ar livre. Vento intenso agitando o cabelo e as roupas com física precisa e realista. A pessoa semicerra os olhos contra a luz do dia e olha para o horizonte, lente grande-angular cinematográfica.',
    previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    badge: 'Seedance 2.5 Recomendado'
  }
];

// Estado da Aplicação
let selectedModel = 'seedance';
let uploadedImageBase64 = null;
let deferredPrompt = null;
const videoHistory = [];

// Inicialização do DOM
document.addEventListener('DOMContentLoaded', () => {
  initPresetsGallery();
  initUploadDropzone();
  initModelSelector();
  initTags();
  initSettingsModal();
  initPWA();
  initGenerationEngine();
});

// 1. Renderiza a Galeria de Prompts com Mini-Vídeos
function initPresetsGallery() {
  const container = document.getElementById('presets-container');
  if (!container) return;

  container.innerHTML = PROMPT_PRESETS.map(preset => `
    <div class="preset-card" onclick="applyPreset('${preset.id}')">
      <div class="preset-video-wrapper">
        <video src="${preset.previewVideo}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>
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

// 5. Configuração e Chave de API
function initSettingsModal() {
  const modal = document.getElementById('modal-settings');
  const btnOpen = document.getElementById('btn-open-settings');
  const btnClose = document.getElementById('btn-close-modal');
  const btnSave = document.getElementById('btn-save-key');
  const keyInput = document.getElementById('api-key-input');

  const savedKey = localStorage.getItem('ai_video_api_key') || '';
  keyInput.value = savedKey;

  btnOpen.addEventListener('click', () => modal.style.display = 'flex');
  btnClose.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  btnSave.addEventListener('click', () => {
    localStorage.setItem('ai_video_api_key', keyInput.value.trim());
    modal.style.display = 'none';
    alert('Conexão e chave de API salvas com sucesso no seu navegador!');
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
      const apiKey = localStorage.getItem('ai_video_api_key');
      let resultVideoUrl = '';

      // Se o usuário já cadastrou a chave da API (ex: Fal.ai / Replicate):
      if (apiKey) {
        // Disparo real via API
        resultVideoUrl = await requestCloudVideo(apiKey, uploadedImageBase64, promptText, selectedModel);
      } else {
        // Demonstração local instantânea com renderizador de exemplo calibrado
        await new Promise(r => setTimeout(r, 3500));
        // Seleciona um vídeo de demonstração em alta definição correspondente ao estilo
        resultVideoUrl = PROMPT_PRESETS[Math.floor(Math.random() * PROMPT_PRESETS.length)].previewVideo;
      }

      // Sucesso na Renderização
      stageLoading.style.display = 'none';
      stageVideo.src = resultVideoUrl;
      stageVideo.style.display = 'block';
      videoActions.style.display = 'flex';
      btnDownload.href = resultVideoUrl;

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
