
import React, { useState, useEffect } from 'react';

interface IntroProps {
  onComplete: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(1);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 2500);
    return () => clearTimeout(t1);
  }, []);

  const handleProceed = () => {
    setStage(3);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onComplete(), 1000);
    }, 1500);
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden transition-all duration-1000 ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}
    >
      <style>{`
        @keyframes intro-pop-in {
          0% { transform: scale(0.8); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes mystical-glow {
          0% { filter: drop-shadow(0 0 5px #DC2626); }
          50% { filter: drop-shadow(0 0 20px #DC2626) drop-shadow(0 0 40px #FFD700); }
          100% { filter: drop-shadow(0 0 5px #DC2626); }
        }
        @keyframes sweep {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        .animate-intro-pop { animation: intro-pop-in 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .mystical-text { animation: mystical-glow 3s infinite ease-in-out; }
        .bg-light-sweep {
          position: absolute;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,0,0,0.05), transparent);
          animation: sweep 10s infinite linear;
        }
      `}</style>

      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-950 to-black"></div>
        <div className="bg-light-sweep" style={{ animationDelay: '0s' }}></div>
        <div className="bg-light-sweep" style={{ animationDelay: '5s', width: '30%', opacity: 0.3 }}></div>
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {stage === 1 && (
          <div className="text-center animate-intro-pop">
            <h1 className="font-comic text-7xl md:text-9xl text-red-600 uppercase tracking-tighter" style={{ textShadow: '4px 4px 0 black' }}>
              REAL LIFE
            </h1>
            <h1 className="font-comic text-7xl md:text-9xl text-white uppercase tracking-tighter mt-[-20px]" style={{ textShadow: '4px 4px 0 black' }}>
              SUPERHEROES
            </h1>
            <div className="mt-4 h-1 w-64 bg-red-600/30 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-red-600 animate-loading-bar" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="max-w-3xl px-6 text-center animate-intro-pop flex flex-col items-center">
            <p className="font-comic text-3xl md:text-5xl text-yellow-400 uppercase leading-tight italic tracking-widest mystical-text mb-12">
              "This engine uses mystical AI powers to determine your heroic destiny based on your biometrics and intent..."
            </p>
            
            <button 
              onClick={handleProceed}
              className="comic-btn bg-white text-black px-12 py-5 text-3xl font-bold hover:bg-yellow-400 transition-all transform hover:scale-105 active:scale-95 group"
            >
              I ACCEPT THE MISSION <span className="inline-block group-hover:translate-x-2 transition-transform">&rarr;</span>
            </button>
            
            <p className="mt-8 font-mono text-[10px] text-white/30 uppercase tracking-[0.4em]">Establishing Neural Connection...</p>
          </div>
        )}

        {stage === 3 && (
          <div className="animate-intro-pop flex flex-col items-center">
             <h1 className="font-comic text-9xl text-white tracking-tighter" style={{ textShadow: '8px 8px 0 #DC2626' }}>ASSEMBLE!</h1>
          </div>
        )}
      </div>

      <button 
        onClick={onComplete}
        className="absolute bottom-10 right-10 text-white/20 hover:text-white/60 font-mono text-xs uppercase tracking-[4px] px-6 py-2 rounded-full transition-all"
      >
        Skip Intro
      </button>
    </div>
  );
};
