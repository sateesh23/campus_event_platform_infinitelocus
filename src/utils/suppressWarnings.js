// Suppress FullStory namespace conflicts (these come from Builder.io platform)
if (typeof window !== 'undefined') {
  // Set FullStory namespace to prevent conflicts
  window._fs_namespace = window._fs_namespace || 'FS';
  
  // Suppress development warnings in production
  if (process.env.NODE_ENV === 'production') {
    // Reduce console noise in production
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      const message = args.join(' ');
      // Filter out known platform warnings
      if (
        message.includes('FullStory namespace conflict') ||
        message.includes('WebSocket connection') ||
        message.includes('IFrame evaluation timeout') ||
        message.includes('Failed to load resource')
      ) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      // Filter out known platform errors
      if (
        message.includes('WebSocket connection to') ||
        message.includes('wss://') ||
        message.includes('Failed to load resource')
      ) {
        return; // Suppress these errors
      }
      originalError.apply(console, args);
    };
  }
}

export default {};
