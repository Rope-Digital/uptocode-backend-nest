import * as fs from 'fs';
import * as path from 'path';
const proxyDir = path.join(process.cwd(), 'data', 'proxylist');

if (!fs.existsSync(proxyDir)) {
  fs.mkdirSync(proxyDir, { recursive: true });
  console.warn(`Created directory: ${proxyDir}. Please add your proxy .txt files there.`);
}

const proxyFiles = fs.readdirSync(proxyDir).filter(file => file.endsWith('.txt'));

const proxies: string[] = [];

for (const file of proxyFiles) {
    const filePath = path.join(proxyDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

    proxies.push(...lines);
}

if (proxies.length === 0) {
    console.warn('Warning: No proxies loaded. The scraper will run without proxies.');
}

export default proxies;