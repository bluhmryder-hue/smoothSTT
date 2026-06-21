/**
 * SmoothSTT STT Engine (Whisper.cpp Bridge)
 * Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
 */
const record = require('node-record-lpcm16');
const path = require('path');

class STTEngine {
  constructor() {
    this.recording = null;
    this.isListening = false;
  }

  startListening() {
    this.isListening = true;
    this.recording = record.record({
      sampleRate: 16000,
      verbose: false,
      recordProgram: 'sox', // or 'rec' or 'arecord'
    });

    // Pipe this to Whisper.cpp process
    console.log("Listening for audio stream...");
  }

  stopListening() {
    if (this.recording) {
      this.recording.stop();
      this.isListening = false;
      console.log("Stopped listening.");
    }
  }
}

module.exports = new STTEngine();
