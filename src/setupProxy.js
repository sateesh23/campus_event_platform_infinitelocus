const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix
      },
      onError: (err, req, res) => {
        console.error('API Proxy Error:', err.message);
        if (res && res.status) {
          res.status(500).send('Proxy Error: Backend server may not be running');
        }
      },
      logLevel: 'silent' // Reduce console noise
    })
  );

  // Proxy Socket.IO WebSocket connections
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:5001', // Fixed: Use same port as backend
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      logLevel: 'silent', // Reduce noise in console
      onProxyReqWs: (proxyReq, req, socket) => {
        console.log('🔌 WebSocket proxy request:', req.url);
      },
      onError: (err, req, res) => {
        console.log('❌ WebSocket Proxy Error:', err.message);
        // Don't crash on WebSocket errors
        if (res && res.writeHead) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('WebSocket proxy error');
        }
      }
    })
  );
};
