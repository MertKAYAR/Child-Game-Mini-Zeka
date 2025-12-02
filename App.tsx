
import React, { useState } from 'react';
import { GameScreen } from './types';
import { MainMenu } from './components/MainMenu';
import { GameCipher } from './components/GameCipher';
import { GameMemory } from './components/GameMemory';
import { GamePattern } from './components/GamePattern'; // Used as Story Mode
import { RewardScreen } from './components/RewardScreen';
import { audioService } from './services/audioService';
import { Home } from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(GameScreen.MENU);
  const [stars, setStars] = useState<number>(0);

  const handleWin = () => {
    // Increment stars
    const newStars = stars + 2; // +2 per win
    setStars(newStars);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case GameScreen.MENU:
        return <MainMenu onNavigate={setCurrentScreen} stars={stars} />;
      case GameScreen.GAME_CIPHER:
        return <GameCipher onWin={handleWin} />;
      case GameScreen.GAME_MEMORY:
        return <GameMemory onWin={handleWin} />;
      case GameScreen.GAME_STORY:
        return <GamePattern />; // Uses the GameStory implementation
      case GameScreen.REWARDS:
        return <RewardScreen />;
      default:
        return <MainMenu onNavigate={setCurrentScreen} stars={stars} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-pink-50 text-gray-800 overflow-hidden relative font-sans">
      
      {/* Background Shapes */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-40 right-0 w-48 h-48 bg-yellow-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Navigation Bar */}
      {currentScreen !== GameScreen.MENU && (
        <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => {
                audioService.cancelSpeech();
                audioService.speak("Ana menü");
                setCurrentScreen(GameScreen.MENU);
            }}
            className="pointer-events-auto bg-white p-3 rounded-full shadow-lg border-2 border-gray-100 hover:scale-110 transition-transform active:bg-gray-100"
          >
            <Home className="text-pink-500" size={32} />
          </button>
          
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-yellow-200 shadow-sm flex items-center gap-2">
            <span className="text-2xl">⭐️</span>
            <span className="text-xl font-bold text-yellow-600">{stars}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="h-[100dvh] w-full flex flex-col pt-20 pb-4 px-4 max-w-4xl mx-auto">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
