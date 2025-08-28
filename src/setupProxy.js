const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
      },
      onError: (err, req, res) => {
        console.error('API Proxy Error:', err.message);
        if (res && res.status) {
          res.status(500).send('Proxy Error: Backend server may not be running');
        }
      },
      logLevel: 'silent'
    })
  );

  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      ws: true,
      logLevel: 'silent',
      onProxyReqWs: (proxyReq, req, socket) => {
        console.log('🔌 WebSocket proxy request:', req.url);
      },
      onError: (err, req, res) => {
        console.log('❌ WebSocket Proxy Error:', err.message);
        if (res && res.writeHead) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('WebSocket proxy error');
        }
      }
    })
  );
};
