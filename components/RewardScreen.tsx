
import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { ArrowLeft, Palette, Check } from 'lucide-react';

// --- DATA STRUCTURES ---

// 1. Available Images Metadata (Reduced to 4 simple Kawaii items)
const GALLERY_ITEMS = [
  { id: 'cat', name: 'Kedi', emoji: '🐱' },
  { id: 'rocket', name: 'Roket', emoji: '🚀' },
  { id: 'flower', name: 'Çiçek', emoji: '🌸' },
  { id: 'butterfly', name: 'Kelebek', emoji: '🦋' }
];

// 2. Color Palette
const PALETTE = [
  { color: '#EF4444', name: 'Kırmızı' },
  { color: '#F97316', name: 'Turuncu' },
  { color: '#FACC15', name: 'Sarı' },
  { color: '#22C55E', name: 'Yeşil' },
  { color: '#3B82F6', name: 'Mavi' },
  { color: '#A855F7', name: 'Mor' },
  { color: '#EC4899', name: 'Pembe' },
  { color: '#78350F', name: 'Kahverengi' },
  { color: '#FFFFFF', name: 'Silgi' }, // Eraser
];

export const RewardScreen: React.FC = () => {
  // --- STATE ---
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string>('#EF4444');
  
  // Persist coloring state: { 'cat': { 'body': '#red', 'tail': '#blue' }, ... }
  const [coloringState, setColoringState] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (!selectedImageId) {
      // audioService.speak("Boyamak istediğin resmi seç!"); 
      // Removed automatic speech on mount to avoid overlapping with menu click
    }
  }, [selectedImageId]);

  // Handle painting a specific part
  const handlePaint = (partId: string) => {
    if (!selectedImageId) return;
    
    audioService.playClick(); // Sound effect
    setColoringState(prev => ({
      ...prev,
      [selectedImageId]: {
        ...(prev[selectedImageId] || {}),
        [partId]: activeColor
      }
    }));
  };

  // Helper to get current color of a part (default white)
  const getFill = (partId: string) => {
    if (!selectedImageId) return '#ffffff';
    return coloringState[selectedImageId]?.[partId] || '#ffffff';
  };

  // --- RENDERERS ---

  // Renders simple KAWAII style SVGs using basic shapes
  const renderCanvas = () => {
    const commonProps = {
      stroke: "#000000", 
      strokeWidth: "5", // Thick lines for kids
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      className: "transition-colors duration-200 cursor-pointer hover:opacity-90"
    };

    switch (selectedImageId) {
      case 'cat':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
             {/* Ears */}
             <path d="M40 60 L 50 10 L 90 40 Z" fill={getFill('earL')} onClick={() => handlePaint('earL')} {...commonProps} />
             <path d="M160 60 L 150 10 L 110 40 Z" fill={getFill('earR')} onClick={() => handlePaint('earR')} {...commonProps} />
             
             {/* Head (Big Circle) */}
             <circle cx="100" cy="110" r="70" fill={getFill('head')} onClick={() => handlePaint('head')} {...commonProps} />
             
             {/* Face Features (Static - Not colorable) */}
             <circle cx="75" cy="100" r="8" fill="black" />
             <circle cx="125" cy="100" r="8" fill="black" />
             <path d="M90 120 Q 100 130 110 120" fill="none" stroke="black" strokeWidth="5" strokeLinecap="round" />
             
             {/* Whiskers */}
             <line x1="40" y1="110" x2="10" y2="100" stroke="black" strokeWidth="4" strokeLinecap="round" />
             <line x1="40" y1="120" x2="10" y2="130" stroke="black" strokeWidth="4" strokeLinecap="round" />
             <line x1="160" y1="110" x2="190" y2="100" stroke="black" strokeWidth="4" strokeLinecap="round" />
             <line x1="160" y1="120" x2="190" y2="130" stroke="black" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );
      case 'rocket':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            {/* Fire */}
             <path d="M80 160 L 100 190 L 120 160 Z" fill={getFill('fire')} onClick={() => handlePaint('fire')} {...commonProps} />
            
            {/* Fins */}
            <path d="M50 130 L 30 160 L 70 150 Z" fill={getFill('finL')} onClick={() => handlePaint('finL')} {...commonProps} />
            <path d="M150 130 L 170 160 L 130 150 Z" fill={getFill('finR')} onClick={() => handlePaint('finR')} {...commonProps} />
            
            {/* Body (Ellipse) */}
            <ellipse cx="100" cy="100" rx="50" ry="80" fill={getFill('body')} onClick={() => handlePaint('body')} {...commonProps} />
            
            {/* Window (Circle) */}
            <circle cx="100" cy="80" r="25" fill={getFill('window')} onClick={() => handlePaint('window')} {...commonProps} />
            <circle cx="100" cy="80" r="20" fill="none" stroke="black" strokeWidth="3" opacity="0.2" pointerEvents="none" />
          </svg>
        );
      case 'flower':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            {/* Stem */}
            <path d="M100 120 L 100 200" stroke="#059669" strokeWidth="10" strokeLinecap="round" />
            
            {/* Leaf */}
            <path d="M100 160 Q 140 140 150 160 Q 140 180 100 160" fill={getFill('leaf')} onClick={() => handlePaint('leaf')} {...commonProps} />

            {/* Petals (Circles around center) */}
            <circle cx="100" cy="50" r="30" fill={getFill('p1')} onClick={() => handlePaint('p1')} {...commonProps} />
            <circle cx="145" cy="90" r="30" fill={getFill('p2')} onClick={() => handlePaint('p2')} {...commonProps} />
            <circle cx="100" cy="130" r="30" fill={getFill('p3')} onClick={() => handlePaint('p3')} {...commonProps} />
            <circle cx="55" cy="90" r="30" fill={getFill('p4')} onClick={() => handlePaint('p4')} {...commonProps} />
            
            {/* Center */}
            <circle cx="100" cy="90" r="25" fill={getFill('center')} onClick={() => handlePaint('center')} {...commonProps} />
            
            {/* Smiley Face */}
            <circle cx="90" cy="85" r="3" fill="black" />
            <circle cx="110" cy="85" r="3" fill="black" />
            <path d="M95 95 Q 100 100 105 95" fill="none" stroke="black" strokeWidth="3" />
          </svg>
        );
      case 'butterfly':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
             {/* Wings Top */}
             <circle cx="140" cy="60" r="40" fill={getFill('wTR')} onClick={() => handlePaint('wTR')} {...commonProps} />
             <circle cx="60" cy="60" r="40" fill={getFill('wTL')} onClick={() => handlePaint('wTL')} {...commonProps} />
             
             {/* Wings Bottom */}
             <circle cx="130" cy="130" r="30" fill={getFill('wBR')} onClick={() => handlePaint('wBR')} {...commonProps} />
             <circle cx="70" cy="130" r="30" fill={getFill('wBL')} onClick={() => handlePaint('wBL')} {...commonProps} />
             
             {/* Body */}
             <rect x="85" y="40" width="30" height="120" rx="15" fill={getFill('body')} onClick={() => handlePaint('body')} {...commonProps} />
             
             {/* Antennae */}
             <path d="M90 45 L 70 20" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
             <path d="M110 45 L 130 20" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
             
             {/* Face */}
             <circle cx="95" cy="60" r="3" fill="black" />
             <circle cx="105" cy="60" r="3" fill="black" />
             <path d="M95 70 Q 100 75 105 70" fill="none" stroke="black" strokeWidth="3" />
          </svg>
        );
      default:
        return null;
    }
  };

  // --- GALLERY VIEW ---
  if (!selectedImageId) {
    return (
      <div className="flex flex-col h-full w-full animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-2 mb-4">
           <Palette className="text-purple-500" size={32} />
           <h2 className="text-3xl font-black text-purple-600">Resim Galerisi</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pb-4">
          {GALLERY_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                audioService.speak(item.name);
                setSelectedImageId(item.id);
              }}
              className="aspect-square bg-white rounded-3xl shadow-md border-b-8 border-gray-200 active:border-b-0 active:translate-y-2 transition-all flex flex-col items-center justify-center hover:bg-purple-50 group"
            >
              <span className="text-7xl group-hover:scale-110 transition-transform drop-shadow-md">{item.emoji}</span>
              <span className="mt-4 font-bold text-xl text-gray-600">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- CANVAS VIEW ---
  return (
    <div className="flex flex-col h-full w-full relative animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => {
            audioService.speak("Galeri");
            setSelectedImageId(null);
          }}
          className="bg-white p-3 rounded-2xl shadow-sm border-2 border-gray-200 flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ArrowLeft size={28} className="text-gray-600" />
          <span className="font-bold text-gray-600 hidden md:block">Geri</span>
        </button>
        <h3 className="text-3xl font-black text-purple-600 tracking-wider">
          {GALLERY_ITEMS.find(i => i.id === selectedImageId)?.name}
        </h3>
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      {/* Canvas Area */}
      <div className="flex-grow bg-white rounded-[2rem] shadow-xl border-4 border-purple-100 p-6 mb-4 flex items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-sm aspect-square">
           {renderCanvas()}
        </div>
      </div>

      {/* Palette */}
      <div className="h-24 bg-white/90 rounded-3xl shadow-lg border-2 border-gray-100 flex items-center px-4 overflow-x-auto gap-4">
        {PALETTE.map((p) => (
          <button
            key={p.color}
            onClick={() => {
              audioService.speak(p.name);
              setActiveColor(p.color);
            }}
            className={`
              w-14 h-14 rounded-full border-4 flex-shrink-0 shadow-sm transition-all flex items-center justify-center
              ${activeColor === p.color ? 'scale-110 border-gray-800 ring-4 ring-gray-200' : 'border-white scale-100 hover:scale-110'}
            `}
            style={{ backgroundColor: p.color }}
          >
            {activeColor === p.color && p.color !== '#FFFFFF' && <Check size={28} className="text-white/80 drop-shadow-md" />}
            {activeColor === p.color && p.color === '#FFFFFF' && <Check size={28} className="text-gray-400" />}
          </button>
        ))}
      </div>
    </div>
  );
};
