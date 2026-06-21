const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, 'D:/LLM/Repos/smoothSTT');
const EXPECTED = [
  'src/main.js',
  'src/stt-engine.js',
  'src/automation.js',
  'src/settings.js',
  'src/index.html',
  'smoothstt-config.json',
  'package.json',
];

function fail(msg) {
  console.error('[REBUILD FAIL]', msg);
  process.exit(1);
}

function check() {
  for (const rel of EXPECTED) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) fail(`Missing required file: ${rel}`);
  }
  console.log('[REBUILD OK] All required files present.');
}

check();
