// ===== PRODUCTS PAGE JAVASCRIPT =====

let currentAnimationType = null;
let uploadedImage = null;
let animationInterval = null;
let lastUploadedFileMeta = null;

// DOM Elements
const animationsGrid = document.getElementById('animationsGrid');
const animationEditorModal = document.getElementById('animationEditorModal');
const modalClose = document.getElementById('modalClose');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const previewOverlay = document.getElementById('previewOverlay');
const changeImageBtn = document.getElementById('changeImageBtn');
const downloadBtn = document.getElementById('downloadBtn');
const editorTitle = document.getElementById('editorTitle');
const editorSubtitle = document.getElementById('editorSubtitle');

const MAX_CANVAS_DIMENSION = 1080; // px
const FRAME_DURATION = 3000; // ms
const FRAME_COUNT = 90; // 30 fps
const MP4_FRAME_RATE = 30;
const FFMPEG_CORE_PATH = 'vendor/ffmpeg/ffmpeg-core.js';

let ffmpegInstance = null;
let ffmpegLoadingPromise = null;

const previewAnimationMap = {
  'rotate': 'rotate-animation',
  'slide-up': 'slide-up-animation',
  'zoom-pop': 'zoom-pop-animation',
  'tilt-sway': 'tilt-sway-animation',
  'pulse-glow': 'pulse-glow-animation'
};

const previewAnimationClasses = Object.values(previewAnimationMap);

const logAnalyticsEvent = (eventName, eventData = {}) => {
  if (typeof window.trackEvent === 'function') {
    window.trackEvent(eventName, eventData);
  } else {
    console.debug('Products analytics event:', eventName, eventData);
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimationCards();
  initializeModal();
  initializeUpload();
  updateDownloadButtonCopy(true);
});

// Initialize Animation Cards
function initializeAnimationCards() {
  const animationCards = document.querySelectorAll('.animation-card');
  
  animationCards.forEach(card => {
    if (card.classList.contains('custom-request-card')) {
      return;
    }
    
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the button
      if (e.target.classList.contains('animation-btn')) {
        return;
      }
      
      const animationType = card.dataset.animationType;
      logAnalyticsEvent('animation_card_selected', {
        animation_type: animationType
      });
      openAnimationEditor(animationType);
    });
    
    // Button click handler
    const btn = card.querySelector('.animation-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const animationType = card.dataset.animationType;
        logAnalyticsEvent('animation_card_selected', {
          animation_type: animationType,
          source: 'cta_button'
        });
        openAnimationEditor(animationType);
      });
    }
  });
}

// Open Animation Editor
function openAnimationEditor(animationType) {
  currentAnimationType = animationType;
  logAnalyticsEvent('animation_editor_open', {
    animation_type: animationType
  });
  
  // Update editor title based on animation type
  const titles = {
    'rotate': {
      es: 'Editor de Animación - Rotación',
      en: 'Animation Editor - Rotation'
    },
    'slide-up': {
      es: 'Editor de Animación - Deslizar Arriba',
      en: 'Animation Editor - Slide Up'
    },
    'zoom-pop': {
      es: 'Editor de Animación - Zoom Pop',
      en: 'Animation Editor - Zoom Pop'
    },
    'tilt-sway': {
      es: 'Editor de Animación - Tilt & Sway',
      en: 'Animation Editor - Tilt & Sway'
    },
    'pulse-glow': {
      es: 'Editor de Animación - Pulse Glow',
      en: 'Animation Editor - Pulse Glow'
    }
  };
  
  const title = titles[animationType] || titles['rotate'];
  editorTitle.textContent = title.es;
  editorTitle.setAttribute('data-es', title.es);
  editorTitle.setAttribute('data-en', title.en);
  
  // Reset preview
  resetPreview();
  
  // Show modal
  animationEditorModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Scroll to top of modal
  const modalContent = animationEditorModal.querySelector('.modal-content');
  modalContent.scrollTop = 0;
}

// Close Modal
function closeModal() {
  animationEditorModal.classList.remove('active');
  document.body.style.overflow = '';
  resetPreview();
  currentAnimationType = null;
  uploadedImage = null;
  lastUploadedFileMeta = null;
  
  // Clear any running animations
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  logAnalyticsEvent('animation_editor_closed');
}

// Initialize Modal
function initializeModal() {
  // Close button
  modalClose.addEventListener('click', closeModal);
  
  // Close on background click
  animationEditorModal.addEventListener('click', (e) => {
    if (e.target === animationEditorModal) {
      closeModal();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && animationEditorModal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Initialize Upload
function initializeUpload() {
  // Click to upload
  uploadArea.addEventListener('click', () => {
    imageInput.click();
  });
  
  // File input change
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  });
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  });
  
  // Change image button
  changeImageBtn.addEventListener('click', () => {
    resetPreview();
    imageInput.click();
  });
  
  // Download button
  downloadBtn.addEventListener('click', handleDownloadClick);
}

// Handle Image Upload
function handleImageUpload(file) {
  lastUploadedFileMeta = {
    name: file.name,
    size: file.size,
    type: file.type
  };

  logAnalyticsEvent('animation_image_uploaded', {
    animation_type: currentAnimationType,
    file_type: file.type,
    file_size: file.size
  });

  const reader = new FileReader();
  
  reader.onload = (e) => {
    uploadedImage = e.target.result;
    previewImage.src = uploadedImage;
    
    // Show preview area
    uploadArea.style.display = 'none';
    previewArea.style.display = 'flex';
    
    // Apply animation
    applyAnimation();
  };
  
  reader.readAsDataURL(file);
}

// Apply Animation
function applyAnimation() {
  if (!currentAnimationType || !uploadedImage) return;
  
  const previewContainer = previewArea.querySelector('.preview-container');
  
  // Remove any existing animation classes
  previewAnimationClasses.forEach(cls => {
    previewContainer.classList.remove(cls);
    previewOverlay.classList.remove(cls);
  });
  
  const targetClass = previewAnimationMap[currentAnimationType];
  if (targetClass) {
    previewContainer.classList.add(targetClass);
  }
}

// Reset Preview
function resetPreview() {
  uploadArea.style.display = 'block';
  previewArea.style.display = 'none';
  previewImage.src = '';
  lastUploadedFileMeta = null;
  
  const previewContainer = previewArea.querySelector('.preview-container');
  if (previewContainer) {
    previewAnimationClasses.forEach(cls => previewContainer.classList.remove(cls));
    previewContainer.style.animation = '';
  }
  
  previewAnimationClasses.forEach(cls => previewOverlay.classList.remove(cls));
  
  imageInput.value = '';
  updateDownloadButtonCopy(true);
}

// Download Animation (GIF or MP4)
async function handleDownloadClick() {
  if (!uploadedImage || !currentAnimationType) {
    const lang = document.documentElement.lang || 'es';
    const message = lang === 'es' ? 'Por favor sube una imagen primero' : 'Please upload an image first';
    alert(message);
    return;
  }

  const lang = document.documentElement.lang || 'es';

  const updateProgress = (text) => {
    if (typeof text === 'string') {
      downloadBtn.textContent = text;
    }
  };

  downloadBtn.disabled = true;
  updateProgress(lang === 'es' ? 'Generando MP4...' : 'Generating MP4...');

  logAnalyticsEvent('animation_download_start', {
    animation_type: currentAnimationType,
    file_type: lastUploadedFileMeta?.type,
    file_size: lastUploadedFileMeta?.size
  });

  try {
    const framePayload = await prepareAnimationFrames();

    await exportMP4(framePayload, lang, updateProgress);

    logAnalyticsEvent('animation_download_success', {
      animation_type: currentAnimationType,
      frame_count: framePayload.frameCount,
      canvas_width: framePayload.canvasWidth,
      canvas_height: framePayload.canvasHeight
    });
  } catch (error) {
    console.error('Animation download error:', error);
    const code = error?.code || 'unknown_error';
    const messages = {
      image_load_error: lang === 'es' ? 'No pudimos cargar tu imagen. Intenta con otro archivo.' : 'We could not load your image. Try a different file.',
      ffmpeg_library_missing: lang === 'es' ? 'FFmpeg no está disponible en este navegador.' : 'FFmpeg is not available in this browser.',
      ffmpeg_render_failed: lang === 'es' ? 'No pudimos generar el MP4. Intenta nuevamente.' : 'We couldn’t generate the MP4. Please try again.',
      unknown_error: lang === 'es' ? 'Ocurrió un error inesperado. Intenta de nuevo.' : 'Something went wrong. Please try again.'
    };
    alert(messages[code] || messages.unknown_error);

    logAnalyticsEvent('animation_download_error', {
      animation_type: currentAnimationType,
      error: error?.message || code
    });
  } finally {
    downloadBtn.disabled = false;
    updateDownloadButtonCopy(true);
  }
}

function prepareAnimationFrames() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const payload = buildFramesFromImage(img);
        resolve(payload);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(buildError('image_load_error', 'Image failed to load'));
    };

    img.src = uploadedImage;
  });
}

function buildFramesFromImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const maxSize = Math.max(img.width, img.height);
  const padding = currentAnimationType === 'slide-up' ? 100 : 50;
  const scale = Math.min(1, MAX_CANVAS_DIMENSION / maxSize);
  const scaledWidth = Math.round(img.width * scale);
  const scaledHeight = Math.round(img.height * scale);
  const adjustedPadding = Math.round(padding * scale);
  const squareSize = Math.max(scaledWidth, scaledHeight);

  canvas.width = squareSize + adjustedPadding * 2;
  canvas.height = squareSize + adjustedPadding * 2;

  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const frames = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const progress = i / FRAME_COUNT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    drawFrame(ctx, img, progress, {
      x,
      y,
      centerX,
      centerY,
      scaledWidth,
      scaledHeight,
      adjustedPadding
    });
    ctx.restore();

    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  return {
    frames,
    frameCount: FRAME_COUNT,
    duration: FRAME_DURATION,
    delay: FRAME_DURATION / FRAME_COUNT,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  };
}

function drawFrame(ctx, img, progress, options) {
  const { x, y, centerX, centerY, scaledWidth, scaledHeight, adjustedPadding } = options;

  ctx.filter = 'none';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  if (currentAnimationType === 'rotate') {
    const angle = progress * Math.PI * 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  } else if (currentAnimationType === 'slide-up') {
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const startY = adjustedPadding + scaledHeight;
    const endY = y;
    const currentY = startY - (startY - endY) * easedProgress;
    ctx.drawImage(img, x, currentY, scaledWidth, scaledHeight);
  } else if (currentAnimationType === 'zoom-pop') {
    const zoom = 0.85 + 0.25 * Math.sin(progress * Math.PI);
    const blur = 6 * (1 - zoom);
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);
    ctx.filter = `blur(${Math.max(0, blur)}px)`;
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(progress * Math.PI);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  } else if (currentAnimationType === 'tilt-sway') {
    const sway = Math.sin(progress * Math.PI * 2) * (Math.PI / 12);
    const lift = Math.sin(progress * Math.PI * 2) * 20;
    ctx.translate(centerX, centerY + lift);
    ctx.rotate(sway);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  } else if (currentAnimationType === 'pulse-glow') {
    const pulseWave = Math.sin(progress * Math.PI * 2);
    const pulse = 0.95 + 0.12 * pulseWave;
    ctx.translate(centerX, centerY);
    ctx.scale(pulse, pulse);
    ctx.translate(-centerX, -centerY);
    ctx.shadowColor = 'rgba(167,139,250,0.8)';
    ctx.shadowBlur = Math.max(20, 60 + 40 * pulseWave);
    ctx.globalAlpha = 0.85 + 0.15 * pulseWave;
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  } else {
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  }
}

async function exportMP4(framePayload, lang, progressCallback) {
  if (progressCallback) {
    progressCallback(lang === 'es' ? 'Cargando FFmpeg...' : 'Loading FFmpeg...');
  }

  const ffmpeg = await ensureFFmpegLoaded().catch(() => {
    throw buildError('ffmpeg_library_missing', 'FFmpeg unavailable');
  });

  if (progressCallback) {
    progressCallback(lang === 'es' ? 'Preparando MP4...' : 'Preparing MP4...');
  }

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = framePayload.canvasWidth;
  tempCanvas.height = framePayload.canvasHeight;
  const tempCtx = tempCanvas.getContext('2d');

  const writtenFiles = [];
  try {
    framePayload.frames.forEach((frameData, index) => {
      tempCtx.putImageData(frameData, 0, 0);
      const dataUrl = tempCanvas.toDataURL('image/png');
      const fileName = `frame${String(index).padStart(4, '0')}.png`;
      ffmpeg.FS('writeFile', fileName, dataURLToUint8Array(dataUrl));
      writtenFiles.push(fileName);
    });

    const fps = MP4_FRAME_RATE;

    if (progressCallback) {
      progressCallback(lang === 'es' ? 'Renderizando MP4...' : 'Rendering MP4...');
    }

    const outputName = 'animation.mp4';
    await ffmpeg.run(
      '-framerate', `${fps}`,
      '-i', 'frame%04d.png',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'veryfast',
      outputName
    );

    const data = ffmpeg.FS('readFile', outputName);
    downloadBlob(new Blob([data.buffer], { type: 'video/mp4' }), `zen-animation-${currentAnimationType}-${Date.now()}.mp4`);
    ffmpeg.FS('unlink', outputName);
  } catch (error) {
    throw buildError('ffmpeg_render_failed', error?.message || 'FFmpeg render failed');
  } finally {
    writtenFiles.forEach(file => {
      try {
        ffmpeg.FS('unlink', file);
      } catch (e) {
        console.warn('Failed to clean frame file', file, e);
      }
    });
  }
}

async function ensureFFmpegLoaded() {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (ffmpegLoadingPromise) {
    return ffmpegLoadingPromise;
  }

  if (!window.FFmpeg || !window.FFmpeg.createFFmpeg) {
    throw buildError('ffmpeg_library_missing', 'FFmpeg library missing');
  }

  ffmpegInstance = window.FFmpeg.createFFmpeg({
    log: false,
    corePath: FFMPEG_CORE_PATH
  });

  ffmpegLoadingPromise = ffmpegInstance.load()
    .then(() => {
      const instance = ffmpegInstance;
      ffmpegLoadingPromise = null;
      return instance;
    })
    .catch((error) => {
      ffmpegInstance = null;
      ffmpegLoadingPromise = null;
      throw error;
    });

  return ffmpegLoadingPromise;
}

function dataURLToUint8Array(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

function buildError(code, message) {
  const error = new Error(message || code);
  error.code = code;
  return error;
}

// Language Support (if needed)
function updateLanguage(lang) {
  document.querySelectorAll('[data-es]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      el.textContent = text;
    }
  });

  updateDownloadButtonCopy(true);
}

function updateDownloadButtonCopy(force = false) {
  if (!downloadBtn) return;
  if (downloadBtn.disabled && !force) return;

  const lang = document.documentElement.lang || 'es';
  const text = lang === 'es' ? 'Descargar MP4' : 'Download MP4';

  downloadBtn.textContent = text;
  downloadBtn.setAttribute('data-es', 'Descargar MP4');
  downloadBtn.setAttribute('data-en', 'Download MP4');
}

