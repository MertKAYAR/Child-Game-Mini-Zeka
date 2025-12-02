import React, { useState } from 'react';
import { audioService } from '../services/audioService';

export const GameMusic: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const musicians = [
    { id: 'cat', icon: '🐱', note: 'C', color: 'bg-orange-300 border-orange-500' },
    { id: 'dog', icon: '🐕', note: 'E', color: 'bg-yellow-300 border-yellow-500' },
    { id: 'frog', icon: '🐸', note: 'G', color: 'bg-green-300 border-green-500' },
    { id: 'duck', icon: '🦆', note: 'B', color: 'bg-blue-300 border-blue-500' }
  ] as const;

  const playSound = (note: any) => {
    audioService.playNote(note);
    // Visual bump effect logic could go here via state, but CSS active state handles basic feedback
  };

  const handleRecord = () => {
    if (recording) return;
    setRecording(true);
    audioService.speak("Kayıt başladı!");
    
    // Simulate recording duration
    setTimeout(() => {
      setRecording(false);
      setShowSaved(true);
      audioService.speak("Kaydedildi!");
      setTimeout(() => setShowSaved(false), 2000);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 relative">
      <div className="bg-white/40 p-4 rounded-3xl mb-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-purple-800 text-center mb-4">Sihirli Müzik Grubu 🎵</h2>
      </div>

      {/* Stage */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {musicians.map((m) => (
          <button
            key={m.id}
            onMouseDown={() => playSound(m.note)}
            onTouchStart={() => playSound(m.note)}
            className={`
              ${m.color} w-24 h-24 md:w-32 md:h-32 rounded-full border-b-8 
              shadow-xl flex items-center justify-center text-6xl 
              transition-transform active:scale-90 hover:scale-105
            `}
          >
            {m.icon}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="relative">
        <button
          onClick={handleRecord}
          disabled={recording}
          className={`
            w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg transition-all
            ${recording ? 'bg-red-100 border-red-500 animate-pulse' : 'bg-red-500 border-red-700 hover:bg-red-400'}
          `}
        >
          <span className="text-3xl">⏺</span>
        </button>
        {recording && <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-red-600">Kayıt...</span>}
      </div>

      {/* Saved Animation */}
      {showSaved && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50 rounded-3xl">
          <div className="bg-white p-8 rounded-3xl animate-bounce flex flex-col items-center">
            <span className="text-6xl">💾</span>
            <span className="text-2xl font-bold text-green-600 mt-2">Kaydedildi!</span>
          </div>
        </div>
      )}
    </div>
  );
};