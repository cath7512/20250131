// server.js
const express = require('express');
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the 'dist' directory (where your built Vue.js app will be)
const distPath = path.join(__dirname, 'dist'); // Adjust if your dist folder has a different name
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// In Codespaces, certificates are often handled automatically. If not:
const key = fs.existsSync('/path/to/your/private.key') ? fs.readFileSync('/path/to/your/private.key') : null;
const cert = fs.existsSync('/path/to/your/certificate.pem') ? fs.readFileSync('/path/to/your/certificate.pem') : null;


const server = https.createServer({ key, cert }, app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('received: %s', message);
    // Handle incoming WebSocket messages here
    wss.clients.forEach((client) => {  // Example: Broadcast message to all clients
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(port, () => {
  console.log(`Server listening at https://localhost:${port}`);
  console.log(`WebSocket server listening on wss://localhost:${port}`);
});
