import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { Trophy, Star, RefreshCw, ArrowRight } from 'lucide-react';

interface GameMemoryProps {
  onWin: () => void;
}

const CARDS_DATA = [
  { id: 'lion', icon: '🦁' },
  { id: 'cat', icon: '🐈' },
  { id: 'dog', icon: '🐕' },
  { id: 'bird', icon: '🐦' },
  { id: 'frog', icon: '🐸' },
  { id: 'monkey', icon: '🐒' },
  { id: 'panda', icon: '🐼' },
  { id: 'fox', icon: '🦊' },
];

const LEVEL_CONFIG = {
  1: { pairs: 2, cols: 'grid-cols-2', label: 'Çok Kolay', cardSize: 'text-6xl', height: 'h-40' }, // 4 Cards
  2: { pairs: 3, cols: 'grid-cols-3', label: 'Kolay', cardSize: 'text-5xl', height: 'h-36' },     // 6 Cards
  3: { pairs: 4, cols: 'grid-cols-4', label: 'Orta', cardSize: 'text-5xl', height: 'h-32' },      // 8 Cards
  4: { pairs: 6, cols: 'grid-cols-4', label: 'Zor', cardSize: 'text-4xl', height: 'h-28' },       // 12 Cards
};

export const GameMemory: React.FC<GameMemoryProps> = ({ onWin }) => {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [cards, setCards] = useState<{uid: number, data: typeof CARDS_DATA[0], isFlipped: boolean, isMatched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  const isProcessing = useRef(false);

  useEffect(() => {
    startNewGame();
  }, [level]);

  const startNewGame = () => {
    const config = LEVEL_CONFIG[level];
    
    // Select N random pairs based on level config
    const availableCards = [...CARDS_DATA].sort(() => 0.5 - Math.random());
    const selected = availableCards.slice(0, config.pairs);
    
    const deck = [...selected, ...selected]
      .sort(() => 0.5 - Math.random())
      .map((item, idx) => ({
        uid: idx,
        data: item,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(deck);
    setFlippedIndices([]);
    setShowLevelModal(false);
    setGameWon(false);
    isProcessing.current = false;
    
    // Audio instruction only on first level start or hard reset
    if (level === 1) {
        audioService.speak("Kartlara dokun ve eşini bul.");
    }
  };

  const handleCardClick = (idx: number) => {
    if (isProcessing.current || cards[idx].isFlipped || cards[idx].isMatched) return;
    if (flippedIndices.length >= 2) return;

    // AUDIO: Just a simple flip sound, NO TTS
    audioService.playFlip();

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      isProcessing.current = true;
      checkMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkMatch = (idx1: number, idx2: number) => {
    const isMatch = cards[idx1].data.id === cards[idx2].data.id;

    if (isMatch) {
      setTimeout(() => {
        // AUDIO: Positive feedback only on match
        audioService.playCorrect();
        audioService.speak("Aferin!");
        
        setCards(prev => prev.map((c, i) => 
          i === idx1 || i === idx2 ? { ...c, isMatched: true } : c
        ));
        setFlippedIndices([]);
        isProcessing.current = false;
        checkWin();
      }, 500);
    } else {
      setTimeout(() => {
        // No TTS on wrong, just flip back
        setCards(prev => prev.map((c, i) => 
          i === idx1 || i === idx2 ? { ...c, isFlipped: false } : c
        ));
        setFlippedIndices([]);
        isProcessing.current = false;
      }, 1000);
    }
  };

  const checkWin = () => {
    setCards(currentCards => {
        const allMatched = currentCards.every(c => c.isMatched);
        if (allMatched) {
            setTimeout(() => {
                handleLevelComplete();
            }, 500);
        }
        return currentCards;
    });
  };

  const handleLevelComplete = () => {
      audioService.playFanfare();
      onWin(); // Add global stars

      if (level < 4) {
          audioService.speak("Tebrikler! Sıradaki seviyeye geçelim mi?");
          setShowLevelModal(true);
      } else {
          audioService.speak("İnanılmaz! Bütün seviyeleri bitirdin! Şampiyonsun!");
          setGameWon(true);
          setShowLevelModal(true);
      }
  };

  const nextLevel = () => {
      if (level < 4) {
          setLevel(prev => (prev + 1) as any);
      } else {
          // Restart from level 1
          setLevel(1);
      }
  };

  const config = LEVEL_CONFIG[level];

  return (
    <div className="w-full max-w-lg mx-auto p-2 h-full flex flex-col relative">
      
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-100 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <span className="font-bold text-indigo-800">Seviye {level}</span>
        </div>
        <div className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
            {config.label}
        </div>
      </div>

      {/* Dynamic Grid */}
      <div className={`grid ${config.cols} gap-3 w-full transition-all duration-500`}>
        {cards.map((card, idx) => (
          <button
            key={card.uid}
            onClick={() => handleCardClick(idx)}
            className={`
              ${config.height} rounded-2xl border-b-[6px] flex items-center justify-center transition-all duration-300 transform
              ${card.isFlipped || card.isMatched 
                ? 'bg-white border-gray-200 rotate-y-180' 
                : 'bg-indigo-400 border-indigo-600 hover:bg-indigo-300 active:border-b-0 active:translate-y-1'}
              ${card.isMatched ? 'opacity-60 scale-95 ring-4 ring-green-300' : ''}
            `}
          >
            {(card.isFlipped || card.isMatched) ? (
              <span className={`${config.cardSize} animate-float drop-shadow-md`}>{card.data.icon}</span>
            ) : (
              <span className="text-indigo-200/50 text-4xl font-black">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Level Complete Modal Overlay */}
      {showLevelModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-4 border-yellow-300 flex flex-col items-center animate-bounce-short max-w-xs w-full">
                  <div className="text-6xl mb-4">
                      {gameWon ? '🏆' : '🌟'}
                  </div>
                  <h2 className="text-2xl font-black text-indigo-900 mb-2 text-center">
                      {gameWon ? 'ŞAMPİYON!' : 'HARİKA!'}
                  </h2>
                  <p className="text-indigo-600 text-center mb-6 font-medium">
                      {gameWon ? 'Bütün kartları buldun!' : 'Diğer seviyeye geçmeye hazır mısın?'}
                  </p>
                  
                  <button 
                    onClick={nextLevel}
                    className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 hover:bg-green-400 transition-colors"
                  >
                      {gameWon ? (
                          <>Başa Dön <RefreshCw/></>
                      ) : (
                          <>Devam Et <ArrowRight/></>
                      )}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};