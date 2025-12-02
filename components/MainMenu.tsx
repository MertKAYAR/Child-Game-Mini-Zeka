import React, { useEffect } from 'react';
import { GameScreen } from '../types';
import { audioService } from '../services/audioService';
import { Gamepad2, BrainCircuit, Palette, Tv } from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void;
  stars: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, stars }) => {
  useEffect(() => {
    // Announce welcome message on mount
    audioService.speak("Oynamak istediğin oyunu seç!");
  }, []);

  const handleNav = (screen: GameScreen, text: string) => {
    audioService.speak(text);
    onNavigate(screen);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-6">
      {/* Header */}
      <div className="bg-white/90 p-6 rounded-[2rem] shadow-xl border-4 border-pink-200 w-full max-w-md text-center transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl font-black text-pink-500 mb-2 drop-shadow-sm">Mini Zeka</h1>
        <div className="inline-flex items-center bg-yellow-100 px-6 py-2 rounded-full border-2 border-yellow-300">
          <span className="text-3xl mr-2">⭐️</span>
          <span className="text-3xl font-bold text-yellow-600">{stars}</span>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {/* Game 1: Cipher */}
        <button
          onClick={() => handleNav(GameScreen.GAME_CIPHER, "Şifre Çözücü")}
          className="aspect-square bg-blue-100 rounded-3xl border-b-8 border-blue-400 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center p-4 hover:bg-blue-200"
        >
          <div className="bg-white p-4 rounded-full mb-2 shadow-sm">
            <BrainCircuit size={48} className="text-blue-500" />
          </div>
          <span className="text-xl font-bold text-blue-600">Şifre Çöz</span>
        </button>

        {/* Game 2: Memory */}
        <button
          onClick={() => handleNav(GameScreen.GAME_MEMORY, "Hafıza Kartları")}
          className="aspect-square bg-green-100 rounded-3xl border-b-8 border-green-400 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center p-4 hover:bg-green-200"
        >
          <div className="bg-white p-4 rounded-full mb-2 shadow-sm">
            <Gamepad2 size={48} className="text-green-500" />
          </div>
          <span className="text-xl font-bold text-green-600">Hafıza</span>
        </button>

        {/* Game 3: Reward / Coloring */}
        <button
          onClick={() => handleNav(GameScreen.REWARDS, "Boyama Kitabı")}
          className="aspect-square bg-purple-100 rounded-3xl border-b-8 border-purple-400 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center p-4 hover:bg-purple-200"
        >
          <div className="bg-white p-4 rounded-full mb-2 shadow-sm">
            <Palette size={48} className="text-purple-500" />
          </div>
          <span className="text-xl font-bold text-purple-600">Boyama</span>
        </button>

        {/* Game 4: Story */}
        <button
          onClick={() => handleNav(GameScreen.GAME_STORY, "Hikaye Zamanı")}
          className="aspect-square bg-orange-100 rounded-3xl border-b-8 border-orange-400 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center p-4 hover:bg-orange-200"
        >
          <div className="bg-white p-4 rounded-full mb-2 shadow-sm">
            <Tv size={48} className="text-orange-500" />
          </div>
          <span className="text-xl font-bold text-orange-600">Hikaye</span>
        </button>
      </div>
    </div>
  );
};