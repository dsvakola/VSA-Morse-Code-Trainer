/**
 * VSA Morse Code Trainer — Atmospheric QRM / QRN Noise Generator
 *
 * Simulates vintage radio atmospheric static, bandpass crackle, and interference.
 * Uses Web Audio API AudioBufferSourceNode with a bandpass filter.
 */

export class NoiseGenerator {
  private audioCtx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  /**
   * Generates a 2-second looped pink/bandpass atmospheric noise buffer.
   */
  private createNoiseBuffer(): AudioBuffer {
    if (!this.audioCtx) {
      throw new Error("AudioContext not initialized");
    }

    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filtering approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  }

  /**
   * Starts noise playback at given intensity (0-100).
   * @param destination Node to mix into (the player's master volume); defaults to the speakers.
   */
  public start(levelPct: number, destination?: AudioNode): void {
    if (!this.audioCtx || levelPct <= 0) return;

    this.stop();

    const buffer = this.createNoiseBuffer();
    this.noiseNode = this.audioCtx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Vintage radio bandpass filter (simulates HF receiver audio bandwidth ~400-2400 Hz)
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.filterNode.type = "bandpass";
    this.filterNode.frequency.value = 800;
    this.filterNode.Q.value = 1.2;

    this.gainNode = this.audioCtx.createGain();
    const normalizedGain = (levelPct / 100) * 0.15; // Max 15% mix volume
    this.gainNode.gain.setValueAtTime(normalizedGain, this.audioCtx.currentTime);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(destination ?? this.audioCtx.destination);

    this.noiseNode.start();
  }

  /**
   * Updates noise level dynamically.
   */
  public setLevel(levelPct: number): void {
    if (this.gainNode && this.audioCtx) {
      const normalizedGain = (Math.max(0, Math.min(100, levelPct)) / 100) * 0.15;
      this.gainNode.gain.setTargetAtTime(normalizedGain, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Stops noise playback.
   */
  public stop(): void {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {
        // Ignored
      }
      this.noiseNode = null;
    }
    if (this.filterNode) {
      this.filterNode.disconnect();
      this.filterNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }
}
