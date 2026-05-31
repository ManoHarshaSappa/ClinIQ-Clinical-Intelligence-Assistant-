// Browser compatibility and extension interference fixes

export function clearAppCache(): void {
  if (typeof window === 'undefined') return;

  try {
    // Clear various storage mechanisms
    localStorage.clear();
    sessionStorage.clear();

    // Force reload without cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    console.log('App cache cleared successfully');
  } catch (error) {
    console.warn('Could not clear all cache:', error);
  }
}

export function detectProblematicExtensions(): string[] {
  const problematicExtensions: string[] = [];

  if (typeof window === 'undefined') return problematicExtensions;

  try {
    // Check for content script modifications
    const scripts = document.querySelectorAll('script[src*="chrome-extension"]');
    if (scripts.length > 0) {
      problematicExtensions.push('Chrome Extensions detected');
    }

    // Check for CSP violations in console
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('Content Security Policy') || message.includes('chrome-extension')) {
        problematicExtensions.push('CSP/Extension conflict detected');
      }
      originalError.apply(console, args);
    };

    // Check for extension-injected elements
    const extensionElements = document.querySelectorAll('[class*="extension"], [id*="extension"]');
    if (extensionElements.length > 0) {
      problematicExtensions.push('Extension DOM modifications detected');
    }

  } catch (error) {
    console.warn('Extension detection failed:', error);
  }

  return problematicExtensions;
}

export function forcePageReload(): void {
  if (typeof window === 'undefined') return;

  // Clear cache and force reload
  clearAppCache();
  window.location.href = window.location.href + '?nocache=' + Date.now();
}

// Auto-fix common extension issues on app startup
export function initBrowserFixes(): void {
  if (typeof window === 'undefined') return;

  // Detect and warn about problematic extensions
  const issues = detectProblematicExtensions();
  if (issues.length > 0) {
    console.warn('Browser compatibility issues detected:', issues);
    console.warn('If you experience navigation issues, try disabling browser extensions or using incognito mode.');
  }

  // Add global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (event.reason?.message?.includes('404') || event.reason?.message?.includes('not found')) {
      console.warn('Patient navigation error detected - this may be due to browser extensions or caching issues');
    }
  });
}