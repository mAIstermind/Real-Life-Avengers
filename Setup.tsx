
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { GENRES, LANGUAGES, Persona } from './types';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    hero: Persona | null;
    friend: Persona | null;
    selectedGenre: string;
    selectedLanguage: string;
    customPremise: string;
    richMode: boolean;
    storyLength: number;
    heroName: string;
    friendName: string;
    onHeroUpload: (file: File) => void;
    onFriendUpload: (file: File) => void;
    onHeroNameChange: (val: string) => void;
    onFriendNameChange: (val: string) => void;
    onGenreChange: (val: string) => void;
    onLanguageChange: (val: string) => void;
    onPremiseChange: (val: string) => void;
    onRichModeChange: (val: boolean) => void;
    onStoryLengthChange: (val: number) => void;
    onFeelingLucky: () => void;
    onLaunch: () => void;
}

const Footer = () => {
  const [remixIndex, setRemixIndex] = useState(0);
  const remixes = [
    "Add sounds to panels",
    "Animate panels with Veo 3",
    "Localize to Klingon",
    "Add a villain generator",
    "Print physical copies",
    "Add voice narration",
    "Create a shared universe"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRemixIndex(prev => (prev + 1) % remixes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white py-3 px-6 flex flex-col md:flex-row justify-between items-center z-[300] border-t-4 border-red-600 font-comic">
        <div className="flex items-center gap-2 text-lg md:text-xl">
            <span className="text-red-500 font-bold">REMIX IDEA:</span>
            <span className="animate-pulse">{remixes[remixIndex]}</span>
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
            <span className="text-gray-500 text-sm hidden md:inline">Powered by Gemini Multiverse</span>
            <a href="https://maistermind.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-400 transition-colors text-xl">Created by DynamicMike at mAIstermind</a>
        </div>
    </div>
  );
};

export const Setup: React.FC<SetupProps> = (props) => {
    if (!props.show && !props.isTransitioning) return null;

    return (
        <>
        <style>{`
             @keyframes knockout-exit {
                0% { transform: scale(1) rotate(1deg); }
                15% { transform: scale(1.1) rotate(-5deg); }
                100% { transform: translateY(-200vh) rotate(1080deg) scale(0.5); opacity: 1; }
             }
             @keyframes pow-enter {
                 0% { transform: translate(-50%, -50%) scale(0) rotate(-45deg); opacity: 0; }
                 30% { transform: translate(-50%, -50%) scale(1.5) rotate(10deg); opacity: 1; }
                 100% { transform: translate(-50%, -50%) scale(1.8) rotate(0deg); opacity: 0; }
             }
          `}</style>
        {props.isTransitioning && (
            <div className="fixed top-1/2 left-1/2 z-[210] pointer-events-none" style={{ animation: 'pow-enter 1s forwards ease-out' }}>
                <svg viewBox="0 0 200 150" className="w-[500px] h-[400px] drop-shadow-[0_10px_0_rgba(0,0,0,0.5)]">
                    <path d="M95.7,12.8 L110.2,48.5 L148.5,45.2 L125.6,74.3 L156.8,96.8 L119.4,105.5 L122.7,143.8 L92.5,118.6 L60.3,139.7 L72.1,103.2 L34.5,108.8 L59.9,79.9 L24.7,57.3 L62.5,54.4 L61.2,16.5 z" fill="#DC2626" stroke="black" strokeWidth="4"/>
                    <text x="100" y="95" textAnchor="middle" fontFamily="'Bangers', cursive" fontSize="70" fill="#FFD700" stroke="black" strokeWidth="2" transform="rotate(-5 100 75)">ASSEMBLE!</text>
                </svg>
            </div>
        )}
        
        <div className={`fixed inset-0 z-[200] overflow-y-auto`}
             style={{
                 background: props.isTransitioning ? 'transparent' : 'rgba(0,0,0,0.85)', 
                 backdropFilter: props.isTransitioning ? 'none' : 'blur(8px)',
                 animation: props.isTransitioning ? 'knockout-exit 1s forwards cubic-bezier(.6,-0.28,.74,.05)' : 'none',
                 pointerEvents: props.isTransitioning ? 'none' : 'auto'
             }}>
          <div className="min-h-full flex items-center justify-center p-4 pb-32 md:pb-24">
            <div className="max-w-[1000px] w-full bg-white p-4 md:p-6 rotate-1 border-[6px] border-black shadow-[12px_12px_0px_rgba(220,38,38,0.6)] text-center relative">
                
                <h1 className="font-comic text-5xl text-black leading-none mb-1 tracking-wide inline-block mr-3" style={{textShadow: '2px 2px 0px #DC2626'}}>REAL LIFE</h1>
                <h1 className="font-comic text-5xl text-red-600 leading-none mb-4 tracking-wide inline-block" style={{textShadow: '2px 2px 0px black'}}>AVENGERS</h1>
                
                <div className="flex flex-col md:flex-row gap-6 mb-6 text-left">
                    
                    {/* Left Column: Cast */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="font-comic text-xl text-black border-b-4 border-red-600 mb-1 flex justify-between">
                            <span>1. RECRUIT HEROES</span>
                        </div>
                        
                        {/* HERO UPLOAD */}
                        <div className={`p-4 border-4 border-dashed ${props.hero ? 'border-green-500 bg-green-50' : 'border-red-300 bg-red-50'} transition-colors relative group`}>
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-comic text-lg uppercase font-bold text-red-900 tracking-wider">PRIMARY HERO (REQUIRED)</p>
                            </div>
                            
                            <input 
                                type="text" 
                                placeholder="Hero's Alias..." 
                                value={props.heroName}
                                onChange={(e) => props.onHeroNameChange(e.target.value)}
                                className="w-full p-2 border-2 border-black font-comic text-lg mb-3 shadow-[3px_3px_0px_rgba(0,0,0,0.1)] focus:outline-none"
                            />
                            
                            {props.hero ? (
                                <div className="flex gap-4 items-center">
                                     <img src={`data:image/jpeg;base64,${props.hero.base64}`} alt="Hero Preview" className="w-24 h-24 object-cover border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.2)] bg-white rotate-[-2deg]" />
                                     <div className="flex flex-col gap-2">
                                        <span className="text-green-600 font-bold font-comic text-sm animate-pulse uppercase">Likeness Verified</span>
                                        <label className="cursor-pointer comic-btn bg-yellow-400 text-black text-sm px-3 py-1 hover:bg-yellow-300 transition-transform active:scale-95 uppercase">
                                            New Identity
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                                        </label>
                                     </div>
                                </div>
                            ) : (
                                <label className="comic-btn bg-red-600 text-white text-lg px-4 py-3 block w-full hover:bg-red-500 cursor-pointer text-center">
                                    CHOOSE PHOTO
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                                </label>
                            )}
                        </div>

                        {/* CO-STAR UPLOAD */}
                        <div className={`p-4 border-4 border-dashed ${props.friend ? 'border-green-500 bg-green-50' : 'border-blue-300 bg-blue-50'} transition-colors`}>
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-comic text-lg uppercase font-bold text-blue-900 tracking-wider">SIDEKICK / CO-STAR</p>
                            </div>

                            <input 
                                type="text" 
                                placeholder="Partner's Alias..." 
                                value={props.friendName}
                                onChange={(e) => props.onFriendNameChange(e.target.value)}
                                className="w-full p-2 border-2 border-black font-comic text-lg mb-3 shadow-[3px_3px_0px_rgba(0,0,0,0.1)] focus:outline-none"
                            />

                            {props.friend ? (
                                <div className="flex gap-4 items-center">
                                    <img src={`data:image/jpeg;base64,${props.friend.base64}`} alt="Co-Star Preview" className="w-24 h-24 object-cover border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.2)] bg-white rotate-[2deg]" />
                                    <div className="flex flex-col gap-2">
                                        <span className="text-green-600 font-bold font-comic text-sm animate-pulse uppercase">Likeness Verified</span>
                                        <label className="cursor-pointer comic-btn bg-yellow-400 text-black text-sm px-3 py-1 hover:bg-yellow-300 transition-transform active:scale-95 uppercase">
                                            New Identity
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onFriendUpload(e.target.files[0])} />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label className="comic-btn bg-blue-600 text-white text-lg px-4 py-3 block w-full hover:bg-blue-500 cursor-pointer text-center">
                                    CHOOSE PHOTO
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onFriendUpload(e.target.files[0])} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Settings */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="font-comic text-xl text-black border-b-4 border-red-600 mb-1">2. DEFINE THE MISSION</div>
                        
                        <div className="bg-red-50 p-4 border-4 border-black h-full flex flex-col gap-4 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]">
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-comic text-base mb-1 font-bold text-red-900 uppercase">THEME</p>
                                    <select value={props.selectedGenre} onChange={(e) => props.onGenreChange(e.target.value)} className="w-full font-comic text-lg p-1 border-2 border-black uppercase bg-white text-black cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,0.2)]">
                                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <p className="font-comic text-base mb-1 font-bold text-red-900 uppercase">ISSUE DEPTH</p>
                                    <select value={props.storyLength} onChange={(e) => props.onStoryLengthChange(parseInt(e.target.value))} className="w-full font-comic text-lg p-1 border-2 border-black uppercase bg-white text-black cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,0.2)]">
                                        {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n} PANELS</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <p className="font-comic text-base font-bold text-red-900 uppercase tracking-tighter">Mission Premise (Zero to Hero? Helping Animals?)</p>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); props.onFeelingLucky(); }}
                                        className="text-xs bg-black text-yellow-400 px-2 py-0.5 font-comic hover:bg-red-600 transition-colors border border-black"
                                    >
                                        🎲 I'M FEELING LUCKY (40+ STORIES)
                                    </button>
                                </div>
                                <textarea 
                                    value={props.customPremise} 
                                    onChange={(e) => props.onPremiseChange(e.target.value)} 
                                    placeholder="e.g. A shy gardener who discovers they can grow massive oxygen forests to save a dying city..." 
                                    className="w-full p-2 border-2 border-black font-comic text-lg h-32 resize-none shadow-[3px_3px_0px_rgba(0,0,0,0.2)] focus:outline-none" 
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-comic text-base font-bold text-red-900">EDITION</p>
                                    <select value={props.selectedLanguage} onChange={(e) => props.onLanguageChange(e.target.value)} className="font-comic text-base p-1 border-2 border-black uppercase bg-white shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                    </select>
                                </div>

                                <label className="flex items-center gap-3 font-comic text-base cursor-pointer text-black p-2 bg-white/50 border-2 border-black hover:bg-white transition-colors">
                                    <input type="checkbox" checked={props.richMode} onChange={(e) => props.onRichModeChange(e.target.checked)} className="w-5 h-5 accent-red-600" />
                                    <span>ENHANCED NARRATION (Novel Mode)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={props.onLaunch} disabled={!props.hero || props.isTransitioning} className="comic-btn bg-red-600 text-white text-4xl px-8 py-4 w-full hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-wider shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] active:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    {props.isTransitioning ? 'INITIALIZING AVENGERS...' : 'ASSEMBLE TEAM!'}
                </button>
            </div>
          </div>
        </div>

        <Footer />
        </>
    );
}
