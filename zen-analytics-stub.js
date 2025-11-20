(function initZenAnalyticsStub() {
  if (typeof window === 'undefined') {
    return;
  }

  const globalRef = window;

  if (!globalRef.ZenAnalytics) {
    const queue = [];

    globalRef.ZenAnalytics = {
      status: 'stub',
      isReady: false,
      queue,
      logEvent(eventName, eventParams = {}) {
        if (!eventName) {
          return;
        }

        queue.push({
          eventName,
          eventParams,
          timestamp: Date.now()
        });

        if (globalRef.location && globalRef.location.hostname === 'localhost') {
          console.debug(`[ZenAnalytics queued] ${eventName}`, eventParams);
        }
      },
      flushQueue(dispatcher) {
        if (!dispatcher || !Array.isArray(queue)) {
          return;
        }

        while (queue.length) {
          const event = queue.shift();
          dispatcher(event.eventName, event.eventParams);
        }
      }
    };
  }

  if (typeof globalRef.trackEvent !== 'function') {
    globalRef.trackEvent = function trackEvent(eventName, eventParams = {}) {
      if (
        globalRef.ZenAnalytics &&
        typeof globalRef.ZenAnalytics.logEvent === 'function'
      ) {
        globalRef.ZenAnalytics.logEvent(eventName, eventParams);
      }
    };
  }
})();

