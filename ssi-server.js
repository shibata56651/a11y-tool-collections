const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

const DEFAULT_PORT = 3001;

// 利用可能なポートを見つける関数
function findAvailablePort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      const actualPort = server.address().port;
      server.close(() => {
        resolve(actualPort);
      });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // ポートが使用中の場合、次のポートを試す
        findAvailablePort(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function processSSI(content, basePath) {
  return content.replace(/<!--#include\s+file="([^"]+)"\s*-->/g, (match, filePath) => {
    try {
      // ルート相対パスの場合は__dirnameをベースにする
      const fullPath = filePath.startsWith('/') 
        ? path.join(__dirname, filePath)
        : path.resolve(basePath, filePath);
      console.log(`SSI: Including ${filePath} from ${fullPath}`);
      const includeContent = fs.readFileSync(fullPath, 'utf8');
      return includeContent;
    } catch (error) {
      console.error(`SSI Error: ${filePath} not found at ${path.resolve(basePath, filePath)}`);
      return `<!-- Error: ${filePath} not found -->`;
    }
  });
}

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(fullPath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  console.log(`Request: ${req.url} -> ${fullPath}`);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`404: File not found - ${fullPath}`);
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('Not Found');
    return;
  }
  
  const stats = fs.statSync(fullPath);
  if (stats.isDirectory()) {
    // ディレクトリアクセス時はindex.htmlを探す
    const indexPath = path.join(fullPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`Directory request: Serving ${indexPath}`);
      const content = fs.readFileSync(indexPath, 'utf8');
      const fileDir = path.dirname(indexPath);
      let processedContent = processSSI(content, fileDir);
      
      // Browser-sync用のリロードスクリプトを自動挿入
      const reloadScript = `
<script>
(function() {
  function connectWebSocket() {
    const ws = new WebSocket('ws://localhost:' + window.location.port);
    ws.onmessage = function(event) {
      if (event.data === 'reload') {
        window.location.reload();
      }
    };
    ws.onclose = function() {
      setTimeout(connectWebSocket, 1000);
    };
  }
  connectWebSocket();
})();
</script>`;
      
      if (processedContent.includes('</body>')) {
        processedContent = processedContent.replace('</body>', reloadScript + '</body>');
      }
      
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(processedContent);
      return;
    } else {
      console.log(`404: No index.html in directory - ${fullPath}`);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('Not Found');
      return;
    }
  }
  
  if (ext === '.html') {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileDir = path.dirname(fullPath);
    let processedContent = processSSI(content, fileDir);
    
    // baseタグは使用しない（ルート相対パスで統一）
    // パス変換も不要（すべてルート相対パスで統一）
    
    // Browser-sync用のリロードスクリプトを自動挿入
    const reloadScript = `
<script>
(function() {
  function connectWebSocket() {
    const ws = new WebSocket('ws://localhost:' + window.location.port);
    ws.onmessage = function(event) {
      if (event.data === 'reload') {
        window.location.reload();
      }
    };
    ws.onclose = function() {
      setTimeout(connectWebSocket, 1000);
    };
  }
  connectWebSocket();
})();
</script>`;
    
    if (processedContent.includes('</body>')) {
      processedContent = processedContent.replace('</body>', reloadScript + '</body>');
    }
    
    res.writeHead(200, { 
      'Content-Type': mimeType + '; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(processedContent);
  } else {
    const content = fs.readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  }
});

// WebSocketサーバーを追加
const WebSocket = require('ws');

const clients = new Set();
let wss;

// ファイル監視
function watchFiles() {
  const watchDirs = ['./', './include/', './dist/'];
  const watchExts = ['.html', '.css', '.js'];
  
  watchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (_, filename) => {
        if (filename && watchExts.some(ext => filename.endsWith(ext))) {
          console.log(`File changed: ${filename}`);
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send('reload');
            }
          });
        }
      });
    }
  });
}

// サーバーを起動する関数
async function startServer() {
  try {
    const port = await findAvailablePort(process.env.PORT || DEFAULT_PORT);
    
    server.listen(port, () => {
      console.log(`SSI Server with auto-reload running on http://localhost:${port}`);
      
      // WebSocketサーバーをHTTPサーバーと同じポートで起動
      wss = new WebSocket.Server({ server });
      
      wss.on('connection', (ws) => {
        clients.add(ws);
        ws.on('close', () => {
          clients.delete(ws);
        });
      });
      
      watchFiles();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();