
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async start(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.start();
  }

  async stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject('Recorder not initialized');

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' }); // or webm
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Return raw base64 without the data prefix for the API
          resolve(base64String.split(',')[1]); 
        };
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }
}

// Helper to play raw PCM audio from Gemini TTS
export async function playPcmAudio(base64Audio: string, sampleRate = 24000) {
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  const dataInt16 = new Int16Array(bytes.buffer);
  
  // Convert Int16 to Float32
  const float32Data = new Float32Array(dataInt16.length);
  for (let i = 0; i < dataInt16.length; i++) {
    float32Data[i] = dataInt16[i] / 32768.0;
  }

  const buffer = audioContext.createBuffer(1, float32Data.length, sampleRate);
  buffer.copyToChannel(float32Data, 0);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
}
