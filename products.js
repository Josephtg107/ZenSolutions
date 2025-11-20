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

const GIF_WORKER_SCRIPT_URL = 'gif.worker.js';
const MAX_CANVAS_DIMENSION = 900; // px

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
  
  // Wait for GIF library to load
  let gifCheckAttempts = 0;
  const checkGIFLibrary = setInterval(() => {
    gifCheckAttempts++;
    if (typeof GIF !== 'undefined') {
      clearInterval(checkGIFLibrary);
      console.log('GIF library loaded successfully');
    } else if (gifCheckAttempts > 50) { // Wait up to 5 seconds
      clearInterval(checkGIFLibrary);
      console.warn('GIF library failed to load');
      logAnalyticsEvent('animation_gif_library_error', {
        attempts: gifCheckAttempts
      });
    }
  }, 100);
});

// Initialize Animation Cards
function initializeAnimationCards() {
  const animationCards = document.querySelectorAll('.animation-card');
  
  animationCards.forEach(card => {
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
  downloadBtn.addEventListener('click', downloadAnimatedGIF);
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
}

// Download Animated GIF
function downloadAnimatedGIF() {
  if (!uploadedImage || !currentAnimationType) {
    const lang = document.documentElement.lang || 'es';
    const message = lang === 'es' ? 'Por favor sube una imagen primero' : 'Please upload an image first';
    alert(message);
    return;
  }

  logAnalyticsEvent('animation_gif_generation_attempt', {
    animation_type: currentAnimationType,
    file_type: lastUploadedFileMeta?.type,
    file_size: lastUploadedFileMeta?.size
  });
  
  // Check if GIF is available
  if (typeof GIF === 'undefined') {
    const lang = document.documentElement.lang || 'es';
    const message = lang === 'es' ? 'La librería de GIF no está cargada. Por favor espera un momento y vuelve a intentar.' : 'GIF library not loaded. Please wait a moment and try again.';
    alert(message);
    return;
  }
  
  // Show loading state
  const downloadBtn = document.getElementById('downloadBtn');
  const lang = document.documentElement.lang || 'es';
  const originalText = downloadBtn.textContent;
  downloadBtn.disabled = true;
  downloadBtn.textContent = lang === 'es' ? 'Generando...' : 'Generating...';
  
  // Create a canvas for the animation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    // Set canvas size - use square for better GIF quality
    const maxSize = Math.max(img.width, img.height);
    const padding = currentAnimationType === 'slide-up' ? 100 : 50; // More padding for slide-up
    const scale = Math.min(1, MAX_CANVAS_DIMENSION / maxSize);
    const scaledWidth = Math.round(img.width * scale);
    const scaledHeight = Math.round(img.height * scale);
    const adjustedPadding = Math.round(padding * scale);
    const squareSize = Math.max(scaledWidth, scaledHeight);

    canvas.width = squareSize + adjustedPadding * 2;
    canvas.height = squareSize + adjustedPadding * 2;
    
    // Center the image
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create frames array first - reduce frame count for faster generation
    const frameCount = 20; // 20 frames for 3 seconds at ~6.7fps (faster generation)
    const duration = 3000; // 3 seconds
    const delay = duration / frameCount; // Delay between frames in ms
    const frames = [];
    
    // Generate all frames first
    console.log('Generating frames...');
    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background (white)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply transformation based on animation type
      ctx.save();
      ctx.filter = 'none';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      
      if (currentAnimationType === 'rotate') {
        const angle = progress * Math.PI * 2;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      } else if (currentAnimationType === 'slide-up') {
        // Ease out animation for smooth slide-up
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        // Start from bottom (padding) and slide up to center
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
        const sway = Math.sin(progress * Math.PI * 2) * (Math.PI / 12); // ~15deg
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
      }
      
      ctx.restore();
      
      // Store frame as image data
      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    
    console.log(`Generated ${frames.length} frames`);
    
    // Initialize GIF.js - Use workers: 0 to avoid CORS issues with worker script
    try {
      const gifOptions = {
        workers: 2,
        quality: 20,
        width: canvas.width,
        height: canvas.height,
        repeat: 0, // Loop forever
        workerScript: GIF_WORKER_SCRIPT_URL
      };
      
      const gif = new GIF(gifOptions);
      
      // Set timeout for safety (longer timeout)
      let timeout = setTimeout(() => {
        if (gif && typeof gif.abort === 'function') {
          gif.abort();
        }
        const lang = document.documentElement.lang || 'es';
        const message = lang === 'es' ? 'La generación está tomando mucho tiempo. Por favor intenta de nuevo.' : 'Generation is taking too long. Please try again.';
        alert(message);
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;
        logAnalyticsEvent('animation_gif_generation_timeout', {
          animation_type: currentAnimationType,
          file_type: lastUploadedFileMeta?.type,
          file_size: lastUploadedFileMeta?.size
        });
      }, 60000); // 60 second timeout
      
      // Register event handlers BEFORE adding frames
      gif.on('progress', (p) => {
        console.log('GIF progress:', p);
        downloadBtn.textContent = lang === 'es' ? `Generando... ${Math.round(p * 100)}%` : `Generating... ${Math.round(p * 100)}%`;
      });
      
      gif.on('error', (error) => {
        console.error('GIF error:', error);
        if (timeout) clearTimeout(timeout);
        const lang = document.documentElement.lang || 'es';
        const message = lang === 'es' ? 'Error al generar el GIF: ' + error : 'Error generating GIF: ' + error;
        alert(message);
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;
        logAnalyticsEvent('animation_gif_generation_error', {
          animation_type: currentAnimationType,
          error: error?.message || String(error)
        });
      });
      
      gif.on('finished', (blob) => {
        if (timeout) clearTimeout(timeout);
        
        console.log('GIF finished, blob size:', blob.size);
        
        if (!blob || blob.size === 0) {
          const lang = document.documentElement.lang || 'es';
          const message = lang === 'es' ? 'Error: El GIF generado está vacío' : 'Error: Generated GIF is empty';
          alert(message);
          downloadBtn.disabled = false;
          downloadBtn.textContent = originalText;
          logAnalyticsEvent('animation_gif_generation_error', {
            animation_type: currentAnimationType,
            error: 'blob_empty'
          });
          return;
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `zen-animation-${currentAnimationType}-${Date.now()}.gif`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        // Reset button
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;

        logAnalyticsEvent('animation_gif_generated', {
          animation_type: currentAnimationType,
          blob_size: blob.size,
          frame_count: frameCount
        });
      });
      
      // Add all frames synchronously
      console.log('Adding frames to GIF...');
      frames.forEach((frameData, index) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(frameData, 0, 0);
        gif.addFrame(tempCtx, { copy: true, delay: delay });
      });
      
      console.log(`Added ${frames.length} frames to GIF, starting render...`);
      
      // Start rendering
      gif.render();
      
    } catch (error) {
      console.error('Error creating GIF:', error);
      const lang = document.documentElement.lang || 'es';
      const message = lang === 'es' ? 'Error al crear el GIF: ' + error.message : 'Error creating GIF: ' + error.message;
      alert(message);
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalText;
      logAnalyticsEvent('animation_gif_generation_error', {
        animation_type: currentAnimationType,
        error: error?.message || String(error)
      });
    }
  };
  
  img.onerror = () => {
    const lang = document.documentElement.lang || 'es';
    const message = lang === 'es' ? 'Error al cargar la imagen' : 'Error loading image';
    alert(message);
    downloadBtn.disabled = false;
    downloadBtn.textContent = originalText;
    logAnalyticsEvent('animation_image_load_error', {
      animation_type: currentAnimationType
    });
  };
  
  img.src = uploadedImage;
}

// Download Image Helper (kept for compatibility)
function downloadImage(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Language Support (if needed)
function updateLanguage(lang) {
  document.querySelectorAll('[data-es]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      el.textContent = text;
    }
  });
}

