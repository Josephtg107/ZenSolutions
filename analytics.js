import {
  initializeApp,
  getApps,
  getApp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getAnalytics,
  logEvent,
  isSupported
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js';

const config = window.ZEN_FIREBASE_CONFIG;
const zenAnalytics = window.ZenAnalytics || {};

function dispatchQueuedEvents(logger) {
  if (!zenAnalytics.queue || !Array.isArray(zenAnalytics.queue)) {
    return;
  }

  while (zenAnalytics.queue.length) {
    const event = zenAnalytics.queue.shift();
    logger(event.eventName, event.eventParams);
  }
}

async function initFirebaseAnalytics() {
  if (
    !config ||
    !config.measurementId ||
    config.measurementId === 'G-XXXXXXXXXX'
  ) {
    console.warn(
      'Zen Analytics: configura tus credenciales en firebase-config.js antes de iniciar.'
    );
    return;
  }

  try {
    const app = getApps().length ? getApp() : initializeApp(config);
    const supported = await isSupported();

    if (!supported) {
      console.warn(
        'Zen Analytics: Firebase Analytics no es compatible con este navegador.'
      );
      return;
    }

    const analyticsInstance = getAnalytics(app);

    const logger = (eventName, eventParams = {}) => {
      if (!eventName) {
        return;
      }
      logEvent(analyticsInstance, eventName, eventParams);
    };

    dispatchQueuedEvents(logger);

    zenAnalytics.logEvent = logger;
    zenAnalytics.isReady = true;
    zenAnalytics.status = 'ready';
    zenAnalytics.queue = [];
  } catch (error) {
    console.error('Zen Analytics: error al inicializar Firebase', error);
  }
}

function autoTrackPageView() {
  window.trackEvent('page_view', {
    page_title: document.title || undefined,
    page_location: window.location.href,
    page_path: window.location.pathname,
    language:
      document.documentElement.lang ||
      navigator.language ||
      navigator.userLanguage
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoTrackPageView, {
    once: true
  });
} else {
  autoTrackPageView();
}

initFirebaseAnalytics();

