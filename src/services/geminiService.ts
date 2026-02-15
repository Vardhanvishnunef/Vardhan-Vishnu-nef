
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateVideoFromImage(imageBuffer: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    // Check for API key selection
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this photo with subtle, cinematic movement.',
        image: {
          imageBytes: imageBuffer,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed.");

      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const videoBlob = await response.blob();
      return URL.createObjectURL(videoBlob);
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        // Handle race condition/stale key
        if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
      }
      console.error("Video generation error:", error);
      throw error;
    }
  }

  async generateImageDescription(imageUrl: string): Promise<string> {
    try {
      // Fetch image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64Data = base64.split(',')[1];

      const model = this.ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        "Analyze this image and provide a short, poetic description (max 2 sentences). Focus on any traditional aspects, cultural significance, or the emotional mood. Do not just list objects.",
        {
          inlineData: {
            data: base64Data,
            mimeType: blob.type
          }
        }
      ]);
      return result.response.text();
    } catch (error) {
      console.error("Image description error:", error);
      return "A beautiful moment captured in time.";
    }
  }
}

export const geminiService = new GeminiService();
