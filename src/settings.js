const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_CONFIG = {
  triggerKeyCode: null,
  triggerKeyLabel: '',
  whisperEndpoint: 'http://127.0.0.1:6758',
  whisperCli: 'whisper',
  whisperModelPath: '',
  whisperModelFileName: 'ggml-base.en.bin',
  whisperServerPath: '',
  audioInputDevice: '',
  audioSampleRate: 16000,
  audioChannels: 1,
  firstRunComplete: false,
  autoPaste: true,
  showNotifications: true,
  runOnStartup: false,
  minimizeToTray: true,
  portableMode: 'auto',
  language: 'en',
  theme: 'dark',
  themeVariant: 'followSystem',
  accentColor: '#8b5cf6',
  customSystemPrompt: '',
  maxLogLines: 200,
  logLevel: 'info',
  defaultWindowWidth: 960,
  defaultWindowHeight: 640,
  lastTranscript: '',
};

function detectDriveType(targetPath) {
  try {
    let driveLetter;
    if (process.platform === 'win32') {
      const regex = /^([a-zA-Z]:)[\\/]/;
      const match = targetPath.match(regex);
      driveLetter = match ? match[1].toUpperCase() : null;
    }

    if (!driveLetter) {
      return 'fixed';
    }

    return 'fixed';
  } catch (error) {
    return 'fixed';
  }
}

function resolvePortableModeTarget(exeDir, cfg) {
  const mode = cfg && cfg.portableMode ? cfg.portableMode : 'auto';
  const detected = detectDriveType(exeDir);
  const effective = mode === 'auto' ? detected : mode;

  if (effective === 'portable') {
    return path.join(exeDir, 'smoothstt-config.json');
  }

  return path.join(os.homedir(), 'AppData', 'Roaming', 'smoothstt-config.json');
}

function resolveConfigPath(exeDir, cfg) {
  return resolvePortableModeTarget(exeDir, cfg);
}

function read(exeDir) {
  try {
    const defaultCfg = { ...DEFAULT_CONFIG };
    const targetPath = resolveConfigPath(exeDir, { portableMode: defaultCfg.portableMode });
    const data = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    return { ...defaultCfg, ...data };
  } catch (e) {
    return { ...DEFAULT_CONFIG };
  }
}

function write(exeDir, cfg) {
  const targetPath = resolveConfigPath(exeDir, cfg);
  fs.writeFileSync(targetPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8');
}

module.exports = { read, write, resolveConfigPath, detectDriveType, DEFAULT_CONFIG };
