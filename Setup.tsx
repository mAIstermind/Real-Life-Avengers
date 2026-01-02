
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { GENRES, Persona, DashboardTheme } from './types';
import { GoogleGenAI } from '@google/genai';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    hero: Persona | null;
    friend: Persona | null;
    villainName: string;
    villainDesc: string;
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
    onVillainNameChange: (val: string) => void;
    onVillainDescChange: (val: string) => void;
    onGenreChange: (val: string) => void;
    onLanguageChange: (val: string) => void;
    onPremiseChange: (val: string) => void;
    onRichModeChange: (val: boolean) => void;
    onStoryLengthChange: (val: number) => void;
    onFeelingLucky: () => void;
    onLaunch: () => void;
}

const THEMES: { id: DashboardTheme, label: string, icon: string }[] = [
    { id: 'noir', label: 'Noir Studio', icon: '📽️' },
    { id: 'pixar', label: 'Pixar Sky', icon: '🎈' },
    { id: 'cyber', label: 'Sci-Fi Deck', icon: '🚀' },
    { id: 'western', label: 'Wanted Poster', icon: '🤠' },
];

const BackgroundLayer = ({ theme }: { theme: DashboardTheme }) => {
    switch (theme) {
        case 'noir':
            return (
                <div className="absolute inset-0 z-[-1] overflow-hidden bg-zinc-950">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-[-15deg]"></div>
                    <div className="absolute inset-0 pointer-events-none animate-scan-line bg-gradient-to-b from-transparent via-white/10 to-transparent h-6 w-full opacity-40"></div>
                </div>
            );
        case 'pixar':
            return (
                <div className="absolute inset-0 z-[-1] overflow-hidden bg-sky-400">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-300 via-blue-200 to-white"></div>
                    <div className="absolute top-[15%] left-[10%] w-64 h-24 bg-white/60 blur-3xl rounded-full animate-float-slow"></div>
                </div>
            );
        case 'cyber':
            return (
                <div className="absolute inset-0 z-[-1] overflow-hidden bg-[#020617]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse"></div>
                </div>
            );
        case 'western':
            return (
                <div className="absolute inset-0 z-[-1] overflow-hidden bg-[#3e2723]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] opacity-60"></div>
                    <div className="absolute inset-0 opacity-10 animate-dust pointer-events-none"></div>
                </div>
            );
    }
};

export const Setup: React.FC<SetupProps> = (props) => {
    const [theme, setTheme] = useState<DashboardTheme>('noir');
    const [isBrainstorming, setIsBrainstorming] = useState(false);

    if (!props.show && !props.isTransitioning) return null;

    const themeConfig = {
        noir: {
            container: "bg-zinc-900 border-[8px] border-black shadow-[30px_30px_0_rgba(0,0,0,1)]",
            section: "bg-black/40 border border-white/10 p-8",
            input: "bg-zinc-800 border-b-2 border-white/20 text-white font-serif focus:border-red-600 focus:bg-zinc-700 transition-all text-2xl italic px-4 py-2 placeholder-white/10 rounded-t-lg",
            button: "bg-red-600 text-white font-comic hover:bg-white hover:text-black transition-all py-8 border-t-4 border-black",
            accent: "text-red-600",
            label: "text-white/60 uppercase tracking-[0.4em] font-mono text-[10px] mb-4"
        },
        pixar: {
            container: "bg-white/95 backdrop-blur-xl border-none shadow-[0_50px_100px_rgba(59,130,246,0.2)] rounded-[4rem]",
            section: "bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100",
            input: "bg-white border-2 border-blue-100 rounded-2xl font-sans font-black text-blue-600 focus:ring-4 focus:ring-blue-200 transition-all px-6 py-4 placeholder-blue-100",
            button: "bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full font-black py-8 text-4xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all",
            accent: "text-blue-500",
            label: "text-blue-400 font-black uppercase tracking-widest text-xs mb-3"
        },
        cyber: {
            container: "bg-[#020617] border-[2px] border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] rounded-xl",
            section: "bg-cyan-950/20 border border-cyan-500/30 p-8 rounded-lg",
            input: "bg-black border border-cyan-500/40 text-cyan-400 font-mono focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] px-4 py-3 placeholder-cyan-900",
            button: "bg-cyan-500 text-black font-black uppercase tracking-tighter text-4xl py-8 hover:bg-white hover:shadow-[0_0_30px_#fff] transition-all",
            accent: "text-cyan-400",
            label: "text-cyan-600 font-mono text-xs uppercase mb-3 flex items-center gap-2"
        },
        western: {
            container: "bg-[#ebd9a9] border-[6px] border-[#3e2723] shadow-[20px_20px_0_#3e2723] p-16 rounded-sm",
            section: "bg-[#dcc7a1] border-2 border-[#3e2723] p-10",
            input: "bg-white/30 border-b-4 border-[#3e2723] font-serif italic text-3xl text-[#2c1810] focus:border-red-900 focus:bg-white/50 transition-all px-4 py-2 placeholder-[#3e2723]/30",
            button: "bg-[#3e2723] text-[#ebd9a9] font-serif font-black text-5xl py-8 hover:bg-red-900 transition-colors",
            accent: "text-[#3e2723]",
            label: "text-[#3e2723]/70 font-serif font-bold uppercase tracking-[0.3em] text-xs mb-3"
        }
    }[theme];

    const brainstormNemesis = async () => {
        if (!props.heroName && !props.customPremise) {
            alert("Identification required before synchronization.");
            return;
        }
        setIsBrainstorming(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Hero: ${props.heroName}. Context: ${props.customPremise}. Theme: ${props.selectedGenre}. Generate a creative nemesis or obstacle. Return JSON {name, description}. Limit description to 25 words.`;
            const res = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            const data = JSON.parse(res.text || "{}");
            props.onVillainNameChange(data.name || "A Nameless Shadow");
            props.onVillainDescChange(data.description || "An unpredictable force threatening the stability of your timeline.");
        } catch (e) { console.error(e); } finally { setIsBrainstorming(false); }
    };

    return (
        <div 
          className="fixed inset-0 z-[200] overflow-y-auto no-scrollbar pt-24 pb-48 transition-all duration-1000"
          style={{ 
            opacity: props.show ? 1 : 0,
            visibility: (props.show || props.isTransitioning) ? 'visible' : 'hidden'
          }}
        >
          <BackgroundLayer theme={theme} />

          <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-10 relative">
            
            {/* Theme Navigator */}
            <div className="flex gap-2 mb-12 z-[300] bg-black/60 p-2 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl">
                {THEMES.map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => setTheme(t.id)}
                        className={`px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 ${theme === t.id ? 'bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-white/50 hover:text-white/80'}`}
                    >
                        <span className="text-xl">{t.icon}</span>
                        <span className="hidden md:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className={`max-w-[1400px] w-full transition-all duration-1000 relative p-8 md:p-16 ${themeConfig.container}`}>
                
                <div className="text-center mb-16 relative">
                    <h1 className={`text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-4 ${theme === 'pixar' ? 'text-blue-500' : theme === 'cyber' ? 'text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]' : theme === 'western' ? 'text-[#3e2723]' : 'text-white italic'}`} style={{ textShadow: theme === 'noir' ? '8px 8px 0 black' : '' }}>
                        {theme === 'noir' && <span className="text-red-600 block mb-2 text-xl tracking-[0.5em] font-mono opacity-80 animate-pulse">CLASSIFIED DOSSIER INKED IN REAL-TIME</span>}
                        REAL LIFE SUPERHEROES
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Column 1 */}
                    <div className={`flex flex-col gap-10 ${themeConfig.section}`}>
                        <div>
                            <div className={themeConfig.label}>01_IDENTIFY_SUBJECT</div>
                            <input type="text" placeholder="ALIAS IDENTITY..." value={props.heroName} onChange={(e) => props.onHeroNameChange(e.target.value)} className={`w-full focus:outline-none mb-6 ${themeConfig.input}`} />
                            
                            <label className="block cursor-pointer group relative overflow-hidden rounded-2xl border-4 border-black">
                                <div className={`aspect-square flex flex-col items-center justify-center transition-all duration-500 ${props.hero ? 'bg-green-500/10' : 'bg-black/20 group-hover:bg-black/40'}`}>
                                    {props.hero ? (
                                        <img src={`data:image/jpeg;base64,${props.hero.base64}`} className="w-full h-full object-cover shadow-2xl transition-transform duration-700 group-hover:scale-110" alt="Hero" />
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-8xl mb-4 grayscale opacity-40">👤</div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">Upload Photo Identity</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                            </label>
                        </div>
                        
                        <div>
                            <input type="text" placeholder="SIDEKICK ALIAS..." value={props.friendName} onChange={(e) => props.onFriendNameChange(e.target.value)} className={`w-full focus:outline-none mb-4 ${themeConfig.input}`} />
                            <label className="block cursor-pointer group">
                                <div className={`p-6 border-2 border-dashed flex items-center gap-4 rounded-xl transition-all ${props.friend ? 'border-green-500/50 bg-green-500/10' : 'border-current opacity-20 group-hover:opacity-40'}`}>
                                    {props.friend ? <img src={`data:image/jpeg;base64,${props.friend.base64}`} className="w-16 h-16 object-cover rounded-full border-2 border-black" alt="Friend" /> : <div className="text-3xl">🤝</div>}
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Add Link Companion</p>
                                </div>
                                <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && props.onFriendUpload(e.target.files[0])} />
                            </label>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className={`flex flex-col gap-10 ${themeConfig.section}`}>
                        <div className="flex-1 flex flex-col">
                            <div className={themeConfig.label}>02_PRIMARY_CONFLICT</div>
                            <input type="text" placeholder="THE ANTAGONIST..." value={props.villainName} onChange={(e) => props.onVillainNameChange(e.target.value)} className={`w-full focus:outline-none mb-8 ${themeConfig.input}`} />
                            <textarea placeholder="Describe the shadow lurking in the path..." value={props.villainDesc} onChange={(e) => props.onVillainDescChange(e.target.value)} className={`w-full flex-1 focus:outline-none resize-none leading-relaxed min-h-[250px] ${themeConfig.input}`} />
                            
                            <button onClick={brainstormNemesis} disabled={isBrainstorming} className="mt-8 flex items-center justify-center gap-4 group bg-black/40 hover:bg-black/60 p-4 rounded-xl transition-colors">
                                <div className={`w-12 h-12 rounded-full border-2 border-current flex items-center justify-center transition-all group-hover:bg-current group-hover:text-black ${isBrainstorming ? 'animate-spin' : ''}`}>
                                    ⚡
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">
                                    {isBrainstorming ? 'Synchronizing Neural Paths...' : 'AI Conflict Brainstorm'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className={`flex flex-col gap-10 ${themeConfig.section}`}>
                        <div>
                            <div className={themeConfig.label}>03_MULTIVERSE_SETTINGS</div>
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase opacity-40 mb-2">Universe</p>
                                    <select value={props.selectedGenre} onChange={(e) => props.onGenreChange(e.target.value)} className={`w-full bg-black/40 border-b-2 border-current focus:outline-none font-bold text-xs py-3 px-2 cursor-pointer rounded-t`}>
                                        {GENRES.map(g => <option key={g} value={g} className="text-black">{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase opacity-40 mb-2">Length</p>
                                    <select value={props.storyLength} onChange={(e) => props.onStoryLengthChange(parseInt(e.target.value))} className={`w-full bg-black/40 border-b-2 border-current focus:outline-none font-bold text-xs py-3 px-2 cursor-pointer rounded-t`}>
                                        {[3, 4, 5, 6].map(n => <option key={n} value={n} className="text-black">{n} PANELS</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mb-10">
                                <p className="text-[10px] font-bold uppercase opacity-40 mb-2">Mission Objective</p>
                                <textarea placeholder="What is the final goal?" value={props.customPremise} onChange={(e) => props.onPremiseChange(e.target.value)} className={`w-full h-48 focus:outline-none resize-none leading-relaxed ${themeConfig.input}`} />
                                <button onClick={props.onFeelingLucky} className="mt-4 text-[11px] font-bold opacity-40 hover:opacity-100 uppercase italic tracking-[0.2em] transition-opacity flex items-center gap-2">
                                    🎲 Roll For Random Destiny
                                </button>
                            </div>

                            <label className="flex items-center gap-4 cursor-pointer group p-6 border-2 border-current/20 rounded-2xl hover:bg-current/5 transition-all">
                                <div className={`w-8 h-8 border-4 border-current rounded flex items-center justify-center transition-all ${props.richMode ? 'bg-current' : ''}`}>
                                    {props.richMode && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100">Hyper-Narration Link</span>
                                    <span className="text-[8px] uppercase opacity-40 font-mono">Advanced Descriptive Engine</span>
                                </div>
                                <input type="checkbox" checked={props.richMode} onChange={(e) => props.onRichModeChange(e.target.checked)} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <div className="relative group w-full max-w-4xl">
                        {theme === 'cyber' && (
                            <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-30 animate-pulse rounded-full"></div>
                        )}
                        <button 
                            onClick={props.onLaunch} 
                            disabled={!props.hero || props.isTransitioning}
                            className={`w-full py-12 text-7xl shadow-2xl disabled:opacity-30 disabled:grayscale relative z-10 transition-all uppercase tracking-tighter ${themeConfig.button}`}
                        >
                            {props.isTransitioning ? 'Linking...' : 'Assemble Multiverse!'}
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
    );
};
