
import React, { useState, useEffect } from 'react';

interface IntroProps {
  onComplete: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000), // Show branding
      setTimeout(() => setStage(2), 3000), // Show mystical powers text
      setTimeout(() => setStage(3), 6000), // Zoom out
      setTimeout(() => onComplete(), 7500), // Finish
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes intro-flash {
          0%, 100% { background-color: #000; }
          50% { background-color: #DC2626; }
        }
        @keyframes mystical-float {
          0% { transform: translateY(0) scale(1); filter: hue-rotate(0deg) blur(0px); }
          50% { transform: translateY(-10px) scale(1.05); filter: hue-rotate(90deg) blur(2px); }
          100% { transform: translateY(0) scale(1); filter: hue-rotate(0deg) blur(0px); }
        }
        .animate-intro-flash { animation: intro-flash 0.5s ease-in-out; }
      `}</style>

      {stage === 1 && (
        <div className="text-center animate-in zoom-in duration-700">
          <h1 className="font-comic text-7xl md:text-9xl text-red-600 uppercase tracking-tighter" style={{ textShadow: '4px 4px 0 black, 8px 8px 0 rgba(220,38,38,0.5)' }}>
            REAL LIFE
          </h1>
          <h1 className="font-comic text-7xl md:text-9xl text-white uppercase tracking-tighter mt-[-20px]" style={{ textShadow: '4px 4px 0 black' }}>
            AVENGERS
          </h1>
        </div>
      )}

      {stage === 2 && (
        <div className="max-w-2xl px-6 text-center">
          <p className="font-comic text-3xl md:text-5xl text-yellow-400 uppercase leading-tight italic tracking-widest" style={{ animation: 'mystical-float 3s infinite ease-in-out' }}>
            "This app is using mystical super powers to determine what might be relevant to you based on the photo and description you input..."
          </p>
          <div className="mt-8 flex justify-center gap-4">
             <div className="w-4 h-4 rounded-full bg-red-600 animate-ping"></div>
             <div className="w-4 h-4 rounded-full bg-blue-600 animate-ping delay-75"></div>
             <div className="w-4 h-4 rounded-full bg-yellow-600 animate-ping delay-150"></div>
          </div>
        </div>
      )}

      {stage === 3 && (
        <div className="animate-out zoom-out-150 fade-out duration-1000 flex flex-col items-center">
           <h1 className="font-comic text-9xl text-white">ASSEMBLE!</h1>
        </div>
      )}
    </div>
  );
};
