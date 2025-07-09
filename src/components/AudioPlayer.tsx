import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-4 flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="text-sage-400 hover:text-sage-500 transition-colors"
          aria-label={isPlaying ? "Mute music" : "Play music"}
        >
          {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 accent-sage-400"
        />
        <audio
          ref={audioRef}
          src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8b334dc.mp3"
          loop
        />
      </div>
    </div>
  );
}