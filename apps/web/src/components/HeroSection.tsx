import { useState, useEffect, useCallback } from 'react';

// Local category images - stored in /public/images/hero/
// Svaka kategorija ima jedinstvene slike - bez ponavljanja
const categoryImages = {
  // Turizam i Odmor - LEVA VISOKA
  tourism: [
    '/images/hero/tourism-1.jpg',
    '/images/hero/tourism-2.jpg',
    '/images/hero/tourism-3.jpg',
    '/images/hero/tourism-4.jpg',
    '/images/hero/tourism-5.jpg',
  ],
  // Ugostiteljstvo - SREDINA GORE LEVO
  hospitality: [
    '/images/hero/hospitality-1.jpg',
    '/images/hero/hospitality-2.jpg',
    '/images/hero/hospitality-3.jpg',
    '/images/hero/hospitality-4.jpg',
    '/images/hero/hospitality-5.jpg',
  ],
  // Usluge - SREDINA GORE DESNO
  services: [
    '/images/hero/services-1.jpg',
    '/images/hero/services-2.jpg',
    '/images/hero/services-3.jpg',
    '/images/hero/services-4.jpg',
    '/images/hero/services-5.jpg',
  ],
  // Vozila - DESNA VISOKA
  vehicles: [
    '/images/hero/vehicles-2.jpg',
    '/images/hero/vehicles-3.jpg',
    '/images/hero/vehicles-4.jpg',
    '/images/hero/vehicles-5.jpg',
  ],
  // Menjam/Poklanjam - DOLE LEVO
  exchange: [
    '/images/hero/exchange-1.jpg',
    '/images/hero/exchange-2.jpg',
    '/images/hero/exchange-4.jpg',
    '/images/hero/exchange-5.jpg',
  ],
  // Razno - DOLE DESNO
  misc: [
    '/images/hero/misc-1.jpg',
    '/images/hero/misc-3.jpg',
    '/images/hero/misc-4.jpg',
    '/images/hero/misc-5.jpg',
  ],
};

// Animation types for image transitions
const animations = [
  'animate-fadeIn',
  'animate-slideInLeft',
  'animate-slideInRight',
  'animate-slideInUp',
  'animate-slideInDown',
  'animate-zoomIn',
  'animate-flipIn',
];

interface HeroSectionProps {
  children?: React.ReactNode;
}

interface GridCell {
  images: string[];
  currentIndex: number;
  animation: string;
  isAnimating: boolean;
}

export default function HeroSection({ children }: HeroSectionProps) {
  const [gridCells, setGridCells] = useState<GridCell[]>([
    { images: categoryImages.tourism, currentIndex: 0, animation: '', isAnimating: false },
    { images: categoryImages.hospitality, currentIndex: 1, animation: '', isAnimating: false },
    { images: categoryImages.services, currentIndex: 2, animation: '', isAnimating: false },
    { images: categoryImages.vehicles, currentIndex: 0, animation: '', isAnimating: false },
    { images: categoryImages.exchange, currentIndex: 1, animation: '', isAnimating: false },
    { images: categoryImages.misc, currentIndex: 2, animation: '', isAnimating: false },
  ]);

  const changeSequence = [0, 3, 1, 4, 2, 5];
  const [sequenceIndex, setSequenceIndex] = useState(0);

  const changeImage = useCallback((cellIndex: number) => {
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    
    setGridCells(prev => prev.map((cell, idx) => {
      if (idx === cellIndex) {
        return {
          ...cell,
          currentIndex: (cell.currentIndex + 1) % cell.images.length,
          animation: randomAnimation,
          isAnimating: true,
        };
      }
      return cell;
    }));

    setTimeout(() => {
      setGridCells(prev => prev.map((cell, idx) => {
        if (idx === cellIndex) {
          return { ...cell, isAnimating: false };
        }
        return cell;
      }));
    }, 800);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const cellToChange = changeSequence[sequenceIndex];
      changeImage(cellToChange);
      setSequenceIndex(prev => (prev + 1) % changeSequence.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [sequenceIndex, changeImage]);

  // Render single image cell
  const ImageCell = ({ cell, className }: { cell: GridCell; className?: string }) => (
    <div className={`relative overflow-hidden ${className || ''}`}>
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
          cell.isAnimating ? cell.animation : ''
        }`}
        style={{ backgroundImage: `url("${cell.images[cell.currentIndex]}")` }}
      />
    </div>
  );

  return (
    <section className="relative w-full h-[380px] md:h-[420px] overflow-hidden">
      {/* 
        Layout like local.ch:
        [LEFT TALL] [CENTER-TOP-LEFT] [CENTER-TOP-RIGHT] [RIGHT TALL]
                    [BOTTOM-LEFT    ] [BOTTOM-RIGHT    ]
      */}
      <div className="absolute inset-0 flex">
        {/* LEFT COLUMN - Tourism (tall) */}
        <div className="w-[20%] h-full p-[3px]">
          <ImageCell cell={gridCells[0]} className="w-full h-full rounded-sm" />
        </div>

        {/* CENTER SECTION */}
        <div className="flex-1 h-full flex flex-col">
          {/* Top row - 2 images */}
          <div className="h-1/2 flex">
            <div className="w-1/2 p-[3px]">
              <ImageCell cell={gridCells[1]} className="w-full h-full rounded-sm" />
            </div>
            <div className="w-1/2 p-[3px]">
              <ImageCell cell={gridCells[2]} className="w-full h-full rounded-sm" />
            </div>
          </div>
          {/* Bottom row - 2 images */}
          <div className="h-1/2 flex">
            <div className="w-1/2 p-[3px]">
              <ImageCell cell={gridCells[4]} className="w-full h-full rounded-sm" />
            </div>
            <div className="w-1/2 p-[3px]">
              <ImageCell cell={gridCells[5]} className="w-full h-full rounded-sm" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Vehicles (tall) */}
        <div className="w-[20%] h-full p-[3px]">
          <ImageCell cell={gridCells[3]} className="w-full h-full rounded-sm" />
        </div>
      </div>

      {/* Search Content Overlay - centralno pozicioniran */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-2xl mx-auto px-4 pointer-events-auto">
          {children}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes flipIn {
          from { transform: perspective(400px) rotateY(90deg); opacity: 0; }
          to { transform: perspective(400px) rotateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
        .animate-slideInDown { animation: slideInDown 0.8s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.8s ease-out; }
        .animate-flipIn { animation: flipIn 0.8s ease-out; }
      `}</style>
    </section>
  );
}
