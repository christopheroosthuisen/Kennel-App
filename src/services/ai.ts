import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Initialize the SDK using Vite env variable
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * 1. Chatbot & General Intelligence
 */
export const chatWithGemini = async (
  history: { role: string, parts: any[] }[], 
  message: string, 
  mode: 'standard' | 'thinking' | 'search' | 'maps' = 'standard'
) => {
  let model = 'gemini-3-flash-preview'; 
  let config: any = {};

  switch (mode) {
    case 'thinking':
      model = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 16000 }; 
      break;
    case 'search':
      model = 'gemini-3-flash-preview';
      config.tools = [{ googleSearch: {} }];
      break;
    case 'maps':
      model = 'gemini-2.5-flash';
      config.tools = [{ googleMaps: {} }];
      break;
    default:
      // Fast response
      model = 'gemini-2.5-flash-lite-latest'; 
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    // Return graceful fallback or rethrow
    throw error;
  }
};

/**
 * 2. Live API (Real-time Voice)
 */
export const connectLiveSession = async (
  onMessage: (msg: LiveServerMessage) => void,
  onOpen: () => void,
  onClose: () => void,
  onError: (err: any) => void
) => {
  return await ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: onOpen,
      onmessage: onMessage,
      onclose: onClose,
      onerror: onError,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
      },
      systemInstruction: 'You are a helpful kennel operations assistant. You can help with scheduling, pet care advice, and general facility management.',
    },
  });
};

/**
 * 3. Image Generation (Nano Banana Pro)
 */
export const generatePetAvatar = async (breed: string, color: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A professional, high-quality photo of a ${color} ${breed} dog, studio lighting, white background.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image Gen Error:", e);
    throw e;
  }
};

/**
 * 4. Image Editing (Nano Banana)
 */
export const editImage = async (base64Image: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image Edit Error:", e);
    throw e;
  }
};

/**
 * 5. Video Generation (Veo)
 */
export const animatePetPhoto = async (base64Image: string) => {
  // Handle Veo API Key requirement
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      image: {
        imageBytes: base64Image,
        mimeType: 'image/jpeg'
      },
      prompt: "Cinematic slow motion shot of this dog looking happy and wagging tail",
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      // Fetch the actual bytes using the API Key. Note: we use the key from init.
      const res = await fetch(`${videoUri}&key=${apiKey}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (e) {
    console.error("Veo Error:", e);
    throw e;
  }
};

/**
 * 6. Audio Transcription
 */
export const transcribeAudio = async (base64Audio: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
          { text: "Transcribe this audio note exactly." }
        ]
      }
    });
    return response.text;
  } catch (e) {
    console.error("Transcription Error:", e);
    return "Error transcribing audio.";
  }
};

/**
 * 7. Video Understanding
 */
export const analyzeVideo = async (file: File) => {
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64 } },
          { text: "Analyze this video of a dog. Describe their behavior, mood, and any potential health issues visible." }
        ]
      }
    });
    return response.text;
  } catch (e) {
    console.error("Video Analysis Error:", e);
    return "Error analyzing video.";
  }
};

/**
 * 8. Image Analysis (Documents)
 */
export const analyzeDocument = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Extract vaccination details (Vaccine Name, Date Given, Expiry Date) from this document. Return as JSON array." }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });
    return response.text;
  } catch (e) {
    console.error("Doc Analysis Error:", e);
    throw e;
  }
};

/**
 * 9. Text to Speech
 */
export const speakText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        }
      }
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    console.error("TTS Error:", e);
    return null;
  }
};