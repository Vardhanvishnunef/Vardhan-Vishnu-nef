
import React, { useState, useRef } from 'react';
import { Page } from '../types';
import Navigation from '../components/Navigation';
import { geminiService } from '../services/geminiService';

interface AnimateProps {
  onNavigate: (page: Page) => void;
}

const Animate: React.FC<AnimateProps> = ({ onNavigate }) => {
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const result = await geminiService.generateVideoFromImage(base64Data, prompt, aspectRatio);
      setVideoUrl(result);
    } catch (error) {
      console.error("Video generation error:", error);
      alert("Something went wrong with video generation. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-40 px-6 pt-10">
      <div className="w-full max-w-md mx-auto flex justify-between items-end mb-8 border-b border-border-paper pb-2">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-lg">movie</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Animate</span>
        </div>
        <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Veo AI</span>
      </div>

      <main className="max-w-md mx-auto space-y-8">
        <div className="bg-paper p-8 shadow-floating border border-border-paper text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Breathe Life into Art</h2>
          <p className="text-xs text-muted leading-relaxed uppercase tracking-widest mb-8">Animate static moments using Google Veo</p>

          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video border-2 border-dashed border-border-paper flex flex-col items-center justify-center cursor-pointer hover:bg-limestone transition-colors group"
            >
              <span className="material-symbols-outlined text-muted text-4xl mb-4 group-hover:scale-110 transition-transform">add_a_photo</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Click to upload photo</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative group">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className={`w-full shadow-lifted border border-border-paper ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}
                  />
                ) : (
                  <img src={image} className={`w-full shadow-lifted border border-border-paper object-cover ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`} alt="Upload preview" />
                )}
                {!loading && !videoUrl && (
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-charcoal/50 text-white p-2 rounded-full hover:bg-charcoal transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="h-16 w-[1px] bg-muted/30 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-full bg-primary animate-slide-down"></div>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">Thinking, rendering, breathing...</p>
                </div>
              ) : videoUrl ? (
                <button
                  onClick={() => setVideoUrl(null)}
                  className="w-full py-4 bg-charcoal text-white text-[10px] font-bold uppercase tracking-widest shadow-lifted hover:opacity-90"
                >
                  Generate Another
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAspectRatio('16:9')}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-border-paper ${aspectRatio === '16:9' ? 'bg-charcoal text-white' : 'bg-paper text-muted'}`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      onClick={() => setAspectRatio('9:16')}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-border-paper ${aspectRatio === '9:16' ? 'bg-charcoal text-white' : 'bg-paper text-muted'}`}
                    >
                      9:16 Portrait
                    </button>
                  </div>
                  <textarea
                    placeholder="Describe the movement (e.g., 'Gentle wind blowing through hair')"
                    className="w-full p-4 text-sm bg-limestone border-border-paper focus:ring-primary focus:border-primary no-scrollbar"
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <button
                    onClick={handleGenerate}
                    className="w-full py-5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-floating transition-transform hover:-translate-y-1 active:scale-95"
                  >
                    Animate with AI
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted leading-relaxed">
            Note: AI generation can take up to 2 minutes. Results are unique every time.
          </p>
        </div>
      </main>

      <Navigation active="animate" onNavigate={onNavigate} />
    </div>
  );
};

export default Animate;
