#!/usr/bin/env node
import { createServer } from 'http';
import { readFile, stat, copyFile, mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ts': 'text/plain'
};

const server = createServer(async (req, res) => {
  try {
    let filePath;
    if (req.url === '/') {
      filePath = '/demo/index.html';
    } else if (req.url.startsWith('/assets/')) {
      // Map /assets/ to /demo/assets/
      filePath = req.url.replace('/assets/', '/demo/assets/');
    } else {
      filePath = req.url;
    }
    filePath = join(__dirname, filePath);
    
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error('Not a file');
    
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'text/plain';
    
    const content = await readFile(filePath);
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
    
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
});

// Copy CSS files before starting server
async function copyAssets() {
  try {
    await mkdir(join(__dirname, 'dist/web-component'), { recursive: true });
    await copyFile(
      join(__dirname, 'src/web-component/styles.css'),
      join(__dirname, 'dist/web-component/styles.css')
    );
    console.log('CSS assets copied to dist/');
  } catch (error) {
    console.log('Note: Could not copy CSS assets:', error.message);
  }
}

await copyAssets();

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log('Serving files from current directory');
});