// Service Worker registration utility

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, notify user
            console.log('New content available, please refresh');
            // You can dispatch a custom event here to show a toast notification
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Unregister service worker
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.unregister();
  } catch {
    return false;
  }
};

// Clear all caches
export const clearAllCaches = async (): Promise<boolean> => {
  if (!('caches' in window)) return false;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    return true;
  } catch {
    return false;
  }
};

// Force update service worker
export const forceUpdateServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  await registration.update();
};

// Check if content is cached
export const isCached = async (url: string): Promise<boolean> => {
  if (!('caches' in window)) return false;

  try {
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const response = await cache.match(url);
      if (response) return true;
    }
    return false;
  } catch {
    return false;
  }
};
