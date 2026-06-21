const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  triggerKeyCode: null,
  whisperEndpoint: 'http://127.0.0.1:6758',
  whisperCli: 'whisper',
  whisperModelPath: '',
  firstRunComplete: false,
  autoPaste: true,
  logLevel: 'info',
};

const configPath = path.join(__dirname, '..', 'smoothstt-config.json');

function read() {
  try {
    if (!fs.existsSync(configPath)) return { ...DEFAULT_CONFIG };
    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return { ...DEFAULT_CONFIG, ...data };
  } catch (e) {
    return { ...DEFAULT_CONFIG };
  }
}

function write(cfg) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8');
}

module.exports = { read, write, configPath, DEFAULT_CONFIG };
