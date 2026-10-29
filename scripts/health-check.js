const http = require('http');

const services = [
  { name: 'ML Forecasting Service', url: 'http://localhost:8000/health' },
  { name: 'ML Readiness', url: 'http://localhost:8000/ready' },
  { name: 'Backend REST API', url: 'http://localhost:5001/api/v1/health' },
  { name: 'Backend DB Readiness', url: 'http://localhost:5001/api/v1/ready' },
  { name: 'Admin Dashboard (Vite)', url: 'http://localhost:5173/' },
  { name: 'Expo Metro Bundler', url: 'http://localhost:8081/' },
];

async function checkUrl(name, url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ name, url, status: res.statusCode === 200 ? 'ONLINE' : `HTTP ${res.statusCode}` });
    });
    req.on('error', (err) => {
      resolve({ name, url, status: `OFFLINE (${err.message})` });
    });
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ name, url, status: 'TIMEOUT' });
    });
  });
}

async function main() {
  console.log('--------------------------------------------------');
  console.log(' SMARTPARK AI — RUNTIME SERVICE HEALTH REPORT     ');
  console.log('--------------------------------------------------');

  for (const s of services) {
    const res = await checkUrl(s.name, s.url);
    const color = res.status === 'ONLINE' ? '✓' : '✗';
    console.log(`${color} [${res.status}] ${res.name.padEnd(26)} -> ${res.url}`);
  }
  console.log('--------------------------------------------------');
}

main();
