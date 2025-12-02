import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { ArrowRight, HelpCircle, Trophy } from 'lucide-react';

interface GameCipherProps {
  onWin: () => void;
}

// --- ASSETS ---
const ALL_ANIMALS = ['🦁', '🐸', '🐱', '🐼', '🦊', '🐨', '🐷', '🐵'];
const SYMBOLS = [
  { id: 'star', char: '★', color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  { id: 'square', char: '■', color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-300' },
  { id: 'circle', char: '●', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-300' },
  { id: 'triangle', char: '▲', color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-300' },
  { id: 'diamond', char: '◆', color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-300' },
  { id: 'heart', char: '♥', color: 'text-pink-500', bg: 'bg-pink-100', border: 'border-pink-300' },
];

type SymbolType = typeof SYMBOLS[number];

// --- LEVEL CONFIGURATION ---
const LEVEL_CONFIG = {
  1: { poolSize: 2, clueRows: 1, questionLen: 2, iconSize: 'text-5xl', boxSize: 'w-20 h-20' }, // Very Easy
  2: { poolSize: 3, clueRows: 2, questionLen: 3, iconSize: 'text-4xl', boxSize: 'w-16 h-16' }, // Normal (Bilsem Standard)
  3: { poolSize: 4, clueRows: 3, questionLen: 3, iconSize: 'text-3xl', boxSize: 'w-14 h-14' }, // Hard
};

export const GameCipher: React.FC<GameCipherProps> = ({ onWin }) => {
  // Game State
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [streak, setStreak] = useState(0); // 2 wins -> Level Up
  
  // Round State
  const [clues, setClues] = useState<{animals: string[], symbols: SymbolType[]}[]>([]);
  const [question, setQuestion] = useState<string[]>([]);
  const [options, setOptions] = useState<SymbolType[][]>([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');

  const generateLevel = () => {
    setFeedback('none');
    const config = LEVEL_CONFIG[level];

    // 1. POOL SELECTION (Consistency Check)
    // Select specific animals for this round. Clues and Questions MUST come from this pool.
    const activeAnimals = [...ALL_ANIMALS].sort(() => 0.5 - Math.random()).slice(0, config.poolSize);
    const activeSymbols = [...SYMBOLS].sort(() => 0.5 - Math.random()).slice(0, config.poolSize);

    // Create Dictionary: { '🦁': StarObject, ... }
    const dictionary: Record<string, SymbolType> = {};
    activeAnimals.forEach((anim, index) => {
        dictionary[anim] = activeSymbols[index];
    });

    // 2. CLUE GENERATION (Guaranteed Solvability)
    // We must ensure EVERY animal in the pool appears at least once in the clues.
    // We create a "deck" of animals that need to be shown.
    let animalsToReveal = [...activeAnimals].sort(() => 0.5 - Math.random());
    
    const generatedClues = [];
    const ITEMS_PER_ROW = 2; 

    for (let i = 0; i < config.clueRows; i++) {
        const rowAnimals: string[] = [];
        
        // Fill the row
        for (let k = 0; k < ITEMS_PER_ROW; k++) {
            if (animalsToReveal.length > 0) {
                // Prioritize showing unseen animals
                rowAnimals.push(animalsToReveal.pop()!);
            } else {
                // If all shown, pick random from active pool
                rowAnimals.push(activeAnimals[Math.floor(Math.random() * activeAnimals.length)]);
            }
        }
        
        // Translate to symbols
        const rowSymbols = rowAnimals.map(a => dictionary[a]);
        generatedClues.push({ animals: rowAnimals, symbols: rowSymbols });
    }
    setClues(generatedClues);

    // 3. QUESTION GENERATION
    // Generate a sequence using ONLY active animals
    const qAnimals = [];
    for(let i=0; i < config.questionLen; i++) {
        qAnimals.push(activeAnimals[Math.floor(Math.random() * activeAnimals.length)]);
    }
    setQuestion(qAnimals);
    
    const correctAns = qAnimals.map(a => dictionary[a]);

    // 4. OPTIONS GENERATION (With Uniqueness Check)
    const uniqueOptions = new Set<string>();
    const finalOptions: SymbolType[][] = [];
    
    // Helper to identify uniqueness based on symbol IDs
    const getOptionKey = (opt: SymbolType[]) => JSON.stringify(opt.map(s => s.id));

    // A) Add Correct Answer
    finalOptions.push(correctAns);
    uniqueOptions.add(getOptionKey(correctAns));

    // B) Generate Distractors (ensure they are unique)
    let safetyLoop = 0;
    while (finalOptions.length < 3 && safetyLoop < 100) {
        safetyLoop++;
        let candidate: SymbolType[] = [];

        // Strategy: Try to shuffle for the first distractor to be "tricky" (same symbols different order)
        // Only if shuffled version is actually different from correct
        if (finalOptions.length === 1) {
             candidate = [...correctAns].sort(() => 0.5 - Math.random());
        } else {
             // Random distractor from pool
             candidate = [];
             for(let i=0; i < config.questionLen; i++) {
                 candidate.push(activeSymbols[Math.floor(Math.random() * activeSymbols.length)]);
             }
        }

        const key = getOptionKey(candidate);
        
        // Check if this specific sequence already exists in our options
        if (!uniqueOptions.has(key)) {
            uniqueOptions.add(key);
            finalOptions.push(candidate);
        }
    }

    // Shuffle options display order so correct isn't always first
    const shuffledOpts = finalOptions
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    setOptions(shuffledOpts);
    
    // Find where the correct answer ended up
    const correctIndex = shuffledOpts.findIndex(o => getOptionKey(o) === getOptionKey(correctAns));
    setCorrectOptionIndex(correctIndex);

    // Instructions
    if (streak === 0 && level === 1) {
        audioService.speak("Kutulara bak. Hangi hayvan, hangi şekil? Şifreyi çöz.");
    }
  };

  useEffect(() => {
    generateLevel();
  }, [level]); // Regenerate when level changes

  const handleSelect = (index: number) => {
    if (feedback !== 'none') return;

    if (index === correctOptionIndex) {
      // WIN
      setFeedback('success');
      audioService.playCorrect();
      
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 2 && level < 3) {
          audioService.speak("Harika! Zorlaşıyor!");
          setTimeout(() => setLevel(prev => (prev + 1) as 1|2|3), 1500); // Level Up
          setStreak(0);
      } else {
          audioService.speak("Doğru bildin!");
          onWin();
          setTimeout(generateLevel, 2500);
      }
      
    } else {
      // LOSE
      setFeedback('error');
      audioService.playWrong();
      audioService.speak("Yanlış oldu. İpuçlarına dikkat et.");
      setStreak(0); // Reset streak on error to ensure mastery
      setTimeout(() => setFeedback('none'), 1500);
    }
  };

  const config = LEVEL_CONFIG[level];

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto gap-2 md:gap-4">
      
      {/* HEADER: Level & Instructions */}
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full text-indigo-700">
            <Trophy size={16} />
            <span className="font-bold text-sm">Seviye {level}</span>
        </div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {level === 1 ? 'Başlangıç' : level === 2 ? 'Orta' : 'Zor'}
        </div>
      </div>

      {/* SECTION 1: CLUES (Dynamic Layout) */}
      <div className="bg-white/90 rounded-3xl p-3 shadow-sm border-2 border-indigo-100 flex-shrink-0 transition-all">
        <div className="flex items-center justify-center gap-2 mb-2 text-indigo-400">
           <HelpCircle size={18} />
           <span className="font-bold text-xs tracking-widest uppercase">İPUÇLARI (Sözlük)</span>
        </div>
        
        <div className="flex flex-col gap-2">
          {clues.map((clue, idx) => (
            <div key={idx} className="flex items-center justify-between bg-indigo-50/50 rounded-xl p-2 px-4 border border-indigo-100">
              {/* Left: Animals */}
              <div className="flex gap-2">
                {clue.animals.map((a, i) => (
                  <div key={i} className={`${config.iconSize} filter drop-shadow-sm animate-pulse`} style={{animationDuration: '3s'}}>{a}</div>
                ))}
              </div>
              
              {/* Arrow */}
              <ArrowRight className="text-indigo-300 w-6 h-6" />

              {/* Right: Symbols */}
              <div className="flex gap-2">
                {clue.symbols.map((s, i) => (
                  <div key={i} className={`${config.boxSize} md:w-12 md:h-12 rounded-lg border-b-4 flex items-center justify-center text-2xl ${s.bg} ${s.border} ${s.color}`}>
                    {s.char}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: QUESTION (Target) */}
      <div className="bg-white rounded-3xl p-4 shadow-lg border-4 border-indigo-200 flex flex-col items-center justify-center flex-grow transition-all">
         
         <div className="flex gap-3 mb-4">
            {question.map((animal, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`${config.boxSize} bg-gray-50 rounded-2xl border-2 border-gray-200 flex items-center justify-center ${config.iconSize} shadow-sm`}>
                        {animal}
                    </div>
                    <ArrowRight className="rotate-90 text-gray-300 w-5 h-5" />
                </div>
            ))}
         </div>

         {/* Answer Placeholders */}
         <div className="flex gap-3">
            {question.map((_, i) => (
                <div key={i} className={`${config.boxSize} rounded-xl border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-300 font-bold bg-gray-50`}>
                    ?
                </div>
            ))}
         </div>
      </div>

      {/* SECTION 3: OPTIONS */}
      <div className="grid grid-cols-1 gap-2 pb-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`
              h-16 w-full rounded-2xl border-b-8 flex items-center justify-center gap-4 transition-all active:border-b-0 active:translate-y-2
              ${feedback === 'success' && idx === correctOptionIndex 
                ? 'bg-green-100 border-green-500 ring-4 ring-green-300 scale-105' 
                : feedback === 'error' && idx === correctOptionIndex
                    ? 'bg-red-50 border-red-200' // Don't reveal correct if wrong, just fade out
                    : 'bg-white border-blue-300 hover:bg-blue-50'}
              ${feedback === 'error' && idx !== correctOptionIndex ? 'opacity-40' : ''}
            `}
          >
            {opt.map((s, i) => (
              <div key={i} className={`text-3xl ${s.color} drop-shadow-sm`}>
                {s.char}
              </div>
            ))}
          </button>
        ))}
      </div>

    </div>
  );
};