const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, 'D:/LLM/Repos/smoothSTT');
const CHECKS = [
  ['package.json', 'package.json'],
  ['src/main.js', 'src/main.js'],
  ['src/stt-engine.js', 'src/stt-engine.js'],
  ['src/automation.js', 'src/automation.js'],
  ['src/settings.js', 'src/settings.js'],
  ['src/index.html', 'src/index.html'],
  ['src/toast.html', 'src/toast.html'],
  ['src/renderer.js', 'src/renderer.js'],
  ['smoothstt-config.json', 'smoothstt-config.json'],
];

function fail(msg) {
  console.error('[PROD FAIL]', msg);
  process.exit(1);
}

function assertExists(label, rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) fail(`Missing required file: ${label} => ${rel}`);
}

function assertContains(label, rel, token) {
  const p = path.join(ROOT, rel);
  const text = fs.readFileSync(p, 'utf-8');
  if (!text.includes(token)) fail(`Missing required token in ${label}: ${token}`);
}

function assertElectronRunnable() {
  const p = path.join(ROOT, 'node_modules', 'electron', 'dist', 'electron.exe');
  if (!fs.existsSync(p)) fail('Electron launcher not present at node_modules/electron/dist/electron.exe');
}

for (const [label, rel] of CHECKS) assertExists(label, rel);

assertContains('settings.js', 'src/settings.js', 'smoothstt-config.json');
assertContains('main.js', 'src/main.js', 'ipcMain');
assertContains('stt-engine.js', 'src/stt-engine.js', 'streamToWhisper');
assertContains('index.html', 'src/index.html', 'SmoothSTT');
assertContains('index.html', 'src/index.html', 'renderer.js');
assertContains('toast.html', 'src/toast.html', 'toast');

assertElectronRunnable();

const configPath = path.join(ROOT, 'smoothstt-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
if (!('whisperEndpoint' in config)) fail('smoothstt-config.json missing whisperEndpoint');
if (!('triggerKeyCode' in config)) fail('smoothstt-config.json missing triggerKeyCode');

console.log('[PROD OK] Production readiness checks passed.');
