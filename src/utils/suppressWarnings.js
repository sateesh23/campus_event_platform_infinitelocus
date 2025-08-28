if (typeof window !== 'undefined') {
  window._fs_namespace = window._fs_namespace || 'FS';
  
  if (process.env.NODE_ENV === 'production') {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (
        message.includes('FullStory namespace conflict') ||
        message.includes('WebSocket connection') ||
        message.includes('IFrame evaluation timeout') ||
        message.includes('Failed to load resource')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (
        message.includes('WebSocket connection to') ||
        message.includes('wss://') ||
        message.includes('Failed to load resource')
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }
}

export default {};
