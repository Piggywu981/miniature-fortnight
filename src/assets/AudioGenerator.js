export class AudioGenerator {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }
  
  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      
      this.initBGM();
    } catch (e) {
      console.error('Audio initialization failed:', e);
    }
  }
  
  createOscillator(type = 'square') {
    if (!this.audioContext) return null;
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    return oscillator;
  }
  
  createGain() {
    if (!this.audioContext) return null;
    return this.audioContext.createGain();
  }
  
  playTone(frequency, duration, type = 'square', volume = 0.1) {
    if (!this.initialized) return;
    
    const oscillator = this.createOscillator(type);
    const gain = this.createGain();
    
    if (!oscillator || !gain) return;
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  shoot() {
    this.playTone(800, 0.05, 'square', 0.15);
    setTimeout(() => this.playTone(600, 0.03, 'square', 0.1), 30);
  }
  
  enemyDeath() {
    this.playTone(400, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(300, 0.1, 'square', 0.1), 50);
    setTimeout(() => this.playTone(200, 0.15, 'square', 0.05), 100);
  }
  
  playerHit() {
    this.playTone(200, 0.15, 'sawtooth', 0.2);
    this.playNoise(0.1, 0.1);
  }
  
  pickup() {
    this.playTone(523, 0.05, 'square', 0.1);
    setTimeout(() => this.playTone(659, 0.05, 'square', 0.1), 50);
    setTimeout(() => this.playTone(784, 0.1, 'square', 0.1), 100);
  }
  
  skill() {
    this.playTone(1500, 0.1, 'sine', 0.15);
    setTimeout(() => this.playTone(2000, 0.2, 'square', 0.1), 100);
  }
  
  explosion() {
    this.playNoise(0.5, 0.3);
    this.playTone(100, 0.3, 'sawtooth', 0.2);
  }
  
  uiClick() {
    this.playTone(1000, 0.03, 'square', 0.05);
  }
  
  waveStart() {
    this.playTone(400, 0.1, 'square', 0.1);
    setTimeout(() => this.playTone(500, 0.1, 'square', 0.1), 100);
    setTimeout(() => this.playTone(600, 0.2, 'square', 0.1), 200);
  }
  
  playNoise(duration, volume = 0.1) {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.createGain();
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    noise.connect(gain);
    gain.connect(this.audioContext.destination);
    
    noise.start();
  }
  
  bgmOscillators = [];
  bgmGain = null;
  bgmPlaying = false;
  currentBGM = 'menu';
  
  initBGM() {
    this.bgmGain = this.createGain();
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
      this.bgmGain.connect(this.audioContext.destination);
    }
  }
  
  playMenuBGM() {
    if (this.bgmPlaying) this.stopBGM();
    this.currentBGM = 'menu';
    this.bgmPlaying = true;
    
    const melody = [261, 329, 392, 523, 392, 329, 261, 220];
    let noteIndex = 0;
    
    const playMelody = () => {
      if (!this.bgmPlaying || this.currentBGM !== 'menu') return;
      
      const osc = this.createOscillator('square');
      if (osc) {
        osc.frequency.setValueAtTime(melody[noteIndex], this.audioContext.currentTime);
        osc.connect(this.bgmGain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
        
        this.bgmOscillators.push(osc);
      }
      
      noteIndex = (noteIndex + 1) % melody.length;
      setTimeout(playMelody, 500);
    };
    
    playMelody();
  }
  
  playGameBGM() {
    if (this.bgmPlaying) this.stopBGM();
    this.currentBGM = 'game';
    this.bgmPlaying = true;
    
    const bass = [130, 130, 164, 164, 196, 196, 130, 130];
    let noteIndex = 0;
    
    const playBass = () => {
      if (!this.bgmPlaying || this.currentBGM !== 'game') return;
      
      const osc = this.createOscillator('sawtooth');
      if (osc) {
        osc.frequency.setValueAtTime(bass[noteIndex], this.audioContext.currentTime);
        osc.connect(this.bgmGain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
        
        this.bgmOscillators.push(osc);
      }
      
      noteIndex = (noteIndex + 1) % bass.length;
      setTimeout(playBass, 250);
    };
    
    playBass();
  }
  
  playGameOverBGM() {
    if (this.bgmPlaying) this.stopBGM();
    this.currentBGM = 'gameover';
    this.bgmPlaying = true;
    
    const melody = [392, 329, 261, 220, 196, 220, 261, 329];
    let noteIndex = 0;
    
    const playMelody = () => {
      if (!this.bgmPlaying || this.currentBGM !== 'gameover') return;
      
      const osc = this.createOscillator('sine');
      if (osc) {
        osc.frequency.setValueAtTime(melody[noteIndex], this.audioContext.currentTime);
        osc.connect(this.bgmGain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.6);
        
        this.bgmOscillators.push(osc);
      }
      
      noteIndex = (noteIndex + 1) % melody.length;
      setTimeout(playMelody, 800);
    };
    
    playMelody();
  }
  
  stopBGM() {
    this.bgmPlaying = false;
    this.bgmOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
      }
    });
    this.bgmOscillators = [];
  }
  
  setBGMVolume(volume) {
    if (this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
  }
}
