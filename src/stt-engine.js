const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const record = require('node-record-lpcm16');

const { read } = require('./settings');

class STTEngine {
  constructor() {
    this.recording = null;
  }

  async runPipeline() {
    const { whisperEndpoint, whisperCli, whisperModelPath } = read();

    if (whisperEndpoint) {
      try {
        return await this.streamToWhisper(whisperEndpoint);
      } catch (error) {
        // fallback to CLI
      }
    }

    if (whisperCli) {
      return this.transcribeCli(whisperCli, whisperModelPath);
    }

    throw new Error('No Whisper endpoint or CLI configured.');
  }

  streamToWhisper(endpoint) {
    return new Promise((resolve, reject) => {
      const tempFile = path.join(os.tmpdir(), `smoothstt-${Date.now()}.wav`);
      this.recording = record.record({
        sampleRate: 16000,
        verbose: false,
        recordProgram: this.detectRecordProgram(os.platform()),
        saveRaw: false,
        recorder: 'sox',
      });

      const writeStream = fs.createWriteStream(tempFile);
      this.recording.stream().pipe(writeStream);

      setTimeout(() => {
        this.recording.stop();
        writeStream.end();

        const req = http.request(
          new URL('/inference', endpoint),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
          },
          (res) => {
            const chunks = [];
            res.on('data', (data) => chunks.push(data));
            res.on('end', () => {
              const text = Buffer.concat(chunks).toString('utf-8');
              fs.unlink(tempFile, () => {});
              resolve(text || '');
            });
          },
        );

        req.on('error', (error) => {
          fs.unlink(tempFile, () => {});
          reject(error);
        });

        req.write(fs.readFileSync(tempFile));
        req.end();
      }, 4000);
    });
  }

  transcribeCli(cli, modelPath) {
    return new Promise((resolve, reject) => {
      const tempFile = path.join(os.tmpdir(), `smoothstt-${Date.now()}.wav`);
      this.recording = record.record({
        sampleRate: 16000,
        verbose: false,
        recordProgram: this.detectRecordProgram(os.platform()),
        saveRaw: false,
        recorder: 'sox',
      });

      const writeStream = fs.createWriteStream(tempFile);
      this.recording.stream().pipe(writeStream);

      setTimeout(() => {
        this.recording.stop();
        writeStream.end();

        const args = modelPath ? [tempFile, '--model', modelPath] : [tempFile];
        const child = spawn(cli, args, { shell: true });

        let stdout = '';
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.on('close', (code) => {
          fs.unlink(tempFile, () => {});
          if (code === 0) resolve(stdout.trim() || '');
          else reject(new Error(`Whisper CLI exited with code ${code}`));
        });
      }, 4000);
    });
  }

  detectRecordProgram(platform) {
    if (platform === 'win32') {
      return 'sox';
    }

    if (platform === 'darwin') return 'rec';
    return 'arecord';
  }
}

module.exports = new STTEngine();
