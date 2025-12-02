import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { Play, ArrowLeft, BookOpen, Star, Pause, X } from 'lucide-react';

// --- DATA TYPES ---
interface StorySlide {
  text: string;
  icon: string;
}

interface Story {
  id: string;
  title: string;
  coverIcon: string;
  themeColor: string; // Tailwind class for background
  progressBarColor: string;
  slides: StorySlide[];
}

// --- STORY CONTENT LIBRARY ---
const STORIES: Story[] = [
  {
    id: 'forest',
    title: 'Orman Macerası',
    coverIcon: '🌳',
    themeColor: 'bg-green-100',
    progressBarColor: 'bg-green-500',
    slides: [
      { text: "Bir varmış bir yokmuş... Ormanda küçük bir fil yaşarmış.", icon: "🐘" },
      { text: "Filin en iyi arkadaşı neşeli bir maymunmuş.", icon: "🐒" },
      { text: "Bir gün, bir ağacın altında parlak bir yıldız bulmuşlar.", icon: "⭐️" },
      { text: "Bu yıldız sihirliymiş! Onlara kocaman bir pasta yapmış.", icon: "🎂" },
      { text: "Mutlu mutlu yiyip dans etmişler. Son.", icon: "🎶" }
    ]
  },
  {
    id: 'space',
    title: 'Uzay Yolculuğu',
    coverIcon: '🚀',
    themeColor: 'bg-indigo-900', // Dark space theme
    progressBarColor: 'bg-indigo-400',
    slides: [
      { text: "Küçük roket, gökyüzüne uçmaya hazırmış.", icon: "🚀" },
      { text: "3, 2, 1... Ateş! Bulutların arasından geçmiş.", icon: "☁️" },
      { text: "Uzay çok karanlıkmış ama yıldızlar pırıl pırılmış.", icon: "✨" },
      { text: "Ay Dede ona gülümsemiş: 'Hoş geldin küçük roket!' demiş.", icon: "🌝" },
      { text: "Roket, Dünya'ya el sallayıp evine dönmüş.", icon: "🌍" }
    ]
  },
  {
    id: 'sea',
    title: 'Deniz Altı',
    coverIcon: '🐠',
    themeColor: 'bg-cyan-100',
    progressBarColor: 'bg-cyan-500',
    slides: [
      { text: "Mavi Balık, derin denizlerde yüzmeyi çok severmiş.", icon: "🐟" },
      { text: "Renkli mercanların arasında saklambaç oynarmış.", icon: "🪸" },
      { text: "Bir gün kırmızı bir yengeçle tanışmış.", icon: "🦀" },
      { text: "Birlikte kocaman su baloncukları yapmışlar.", icon: "🫧" },
      { text: "Akşam olunca yumuşak yosun yatağında uyumuşlar.", icon: "😴" }
    ]
  }
];

export const GameStory: React.FC = () => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- AUTO-PLAY LOGIC ---
  useEffect(() => {
    if (!activeStory) return;

    if (isPlaying) {
        playSlide();
    }

    // Cleanup when component unmounts or story stops
    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        audioService.cancelSpeech();
    };
  }, [slideIndex, activeStory, isPlaying]);

  const playSlide = () => {
      if (!activeStory) return;

      const currentText = activeStory.slides[slideIndex].text;
      
      // Use the callback version to detect when speech finishes
      audioService.speakWithCallback(currentText, () => {
          // Speech finished. Wait 1.5 seconds then advance.
          timerRef.current = setTimeout(() => {
              if (slideIndex < activeStory.slides.length - 1) {
                  setSlideIndex(prev => prev + 1);
              } else {
                  // Story finished
                  finishStory();
              }
          }, 1500); 
      });
  };

  const finishStory = () => {
      setIsPlaying(false);
      audioService.speak("Hikaye bitti. Harikaydı!");
      setTimeout(() => {
          returnToLibrary();
      }, 2000);
  };

  const handleSelectStory = (story: Story) => {
    setActiveStory(story);
    setSlideIndex(0);
    setIsPlaying(true);
    // Announce title then the useEffect triggers the first slide
    audioService.speak(story.title);
  };

  const returnToLibrary = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      audioService.cancelSpeech();
      setIsPlaying(false);
      setActiveStory(null);
  };

  // --- VIEW 1: LIBRARY MENU ---
  if (!activeStory) {
    return (
      <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 px-2">
            <BookOpen className="text-orange-500" size={36} />
            <h2 className="text-3xl font-black text-orange-600">Hikaye Seç</h2>
        </div>

        {/* Bookshelf Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pb-4">
            {STORIES.map((story) => (
                <button
                    key={story.id}
                    onClick={() => handleSelectStory(story)}
                    className={`
                        relative group flex flex-col items-center p-6 rounded-3xl shadow-xl transition-transform hover:scale-105 active:scale-95 border-b-8 border-black/10
                        ${story.id === 'space' ? 'bg-indigo-100' : story.id === 'sea' ? 'bg-cyan-100' : 'bg-green-100'}
                    `}
                >
                    {/* Book Cover Visual */}
                    <div className="text-8xl mb-4 drop-shadow-md transform group-hover:rotate-12 transition-transform duration-300">
                        {story.coverIcon}
                    </div>
                    
                    {/* Title */}
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl font-bold text-xl text-gray-800 w-full text-center shadow-sm">
                        {story.title}
                    </div>

                    {/* Decorative Star */}
                    <Star className="absolute top-4 right-4 text-yellow-400 fill-current animate-pulse" size={24} />
                </button>
            ))}
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTO-PLAY STORY PLAYER ---
  const currentSlide = activeStory.slides[slideIndex];
  const isSpaceTheme = activeStory.id === 'space';
  const progressPercent = ((slideIndex + 1) / activeStory.slides.length) * 100;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-between p-4 md:p-8 transition-colors duration-1000 ${activeStory.themeColor} rounded-3xl border-[6px] border-white shadow-2xl relative overflow-hidden`}>
      
      {/* Top Controls: EXIT BUTTON ONLY */}
      <div className="w-full flex justify-between z-20">
        <button 
            onClick={returnToLibrary}
            className="bg-red-500 hover:bg-red-400 text-white p-3 rounded-2xl shadow-lg border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
        >
            <ArrowLeft size={28} />
            <span className="font-bold hidden md:inline">Çıkış</span>
        </button>
      </div>
      
      {/* Scene Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        {/* Icon */}
        <span className={`text-[8rem] md:text-[12rem] drop-shadow-2xl animate-float transition-all duration-500 transform scale-100`}>
            {currentSlide.icon}
        </span>
        
        {/* Text Container */}
        <div className={`mt-8 p-6 rounded-3xl text-center max-w-lg ${isSpaceTheme ? 'bg-black/30 text-white' : 'bg-white/80 text-gray-800'} backdrop-blur-md shadow-lg border-2 border-white/20`}>
             <p className="text-2xl md:text-3xl font-bold leading-relaxed">
                 {currentSlide.text}
             </p>
        </div>
      </div>

      {/* Progress Bar (Visual Feedback) */}
      <div className="w-full max-w-lg mt-6 bg-white/30 h-4 rounded-full overflow-hidden shadow-inner border-2 border-white/50">
          <div 
            className={`h-full ${activeStory.progressBarColor} transition-all duration-1000 ease-in-out`}
            style={{ width: `${progressPercent}%` }}
          />
      </div>
    </div>
  );
};

// Aliasing for compatibility with App.tsx import
export const GamePattern = GameStory;