
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
    { id: 'noir', label: 'Movie Studio', icon: '📽️' },
    { id: 'pixar', label: 'Pixar Sky', icon: '🎈' },
    { id: 'cyber', label: 'Sci-Fi Deck', icon: '🚀' },
    { id: 'western', label: 'Wanted Poster', icon: '🤠' },
];

const BackgroundLayer = ({ theme }: { theme: DashboardTheme }) => {
    switch (theme) {
        case 'noir':
            return (
                <div className="absolute inset-0 z-[-1] overflow-hidden bg-zinc-950">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-[-15deg]"></div>
                    <div className="absolute inset-0 pointer-events-none animate-scan-line bg-gradient-to-b from-transparent via-white/5 to-transparent h-4 w-full"></div>
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
            container: "bg-black/90 backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,1)] rounded-none",
            section: "bg-white/5 border border-white/10 p-8",
            input: "bg-transparent border-b border-white/20 text-white font-serif focus:border-red-600 transition-all text-2xl italic px-0 placeholder-white/10",
            button: "bg-white text-black font-black hover:bg-red-600 hover:text-white transition-all py-8",
            accent: "text-red-600",
            label: "text-white/40 uppercase tracking-[0.3em] font-mono text-[10px] mb-4"
        },
        pixar: {
            container: "bg-white/95 backdrop-blur-xl border-none shadow-[0_50px_100px_rgba(59,130,246,0.1)] rounded-[4rem]",
            section: "bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100",
            input: "bg-white/80 border-none rounded-2xl font-sans font-black text-blue-600 focus:ring-4 focus:ring-blue-200 transition-all px-6 py-4 placeholder-blue-100",
            button: "bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full font-black py-8 text-4xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all",
            accent: "text-blue-500",
            label: "text-blue-400 font-black uppercase tracking-widest text-xs mb-3"
        },
        cyber: {
            container: "bg-[#020617]/90 backdrop-blur-3xl border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.1)] rounded-xl",
            section: "bg-cyan-950/20 border border-cyan-900/50 p-8 rounded-lg",
            input: "bg-black border border-cyan-500/40 text-cyan-400 font-mono focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] px-4 py-3 placeholder-cyan-900",
            button: "bg-cyan-500 text-black font-black uppercase tracking-tighter text-4xl py-8 hover:bg-white hover:shadow-[0_0_30px_#fff] transition-all",
            accent: "text-cyan-400",
            label: "text-cyan-800 font-mono text-xs uppercase mb-3 flex items-center gap-2"
        },
        western: {
            container: "bg-[#ebd9a9] border-[3px] border-[#3e2723] shadow-[25px_25px_0_#3e2723] p-16 rounded-sm",
            section: "bg-[#dcc7a1]/40 border border-[#3e2723]/20 p-10",
            input: "bg-transparent border-b-2 border-[#3e2723] font-serif italic text-3xl text-[#2c1810] focus:border-red-900 transition-all px-0 placeholder-[#3e2723]/20",
            button: "bg-[#3e2723] text-[#ebd9a9] font-serif font-black text-5xl py-8 hover:bg-red-900 transition-colors",
            accent: "text-[#3e2723]",
            label: "text-[#3e2723]/50 font-serif font-bold uppercase tracking-widest text-xs mb-3"
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
            <div className="flex gap-2 mb-12 z-[300] bg-black/40 p-2 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl">
                {THEMES.map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => setTheme(t.id)}
                        className={`px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${theme === t.id ? 'bg-white text-black scale-105 shadow-xl' : 'text-white/40 hover:text-white/80'}`}
                    >
                        <span>{t.icon}</span>
                        <span className="hidden md:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className={`max-w-[1400px] w-full transition-all duration-1000 relative p-8 md:p-16 ${themeConfig.container}`}>
                <div className="text-center mb-16 relative">
                    <h1 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 ${theme === 'pixar' ? 'text-blue-500' : theme === 'cyber' ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]' : theme === 'western' ? 'text-[#3e2723]' : 'text-white italic'}`}>
                        {theme === 'noir' && <span className="text-red-600 block mb-2 text-xl tracking-[0.5em] font-mono opacity-80 animate-pulse">CLASSIFIED DOSSIER INKED IN REAL-TIME</span>}
                        REAL LIFE SUPERHEROES
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className={`flex flex-col gap-10 ${themeConfig.section}`}>
                        <div>
                            <div className={themeConfig.label}>01_IDENTIFY_SUBJECT</div>
                            <input type="text" placeholder="IDENTITY ALIAS..." value={props.heroName} onChange={(e) => props.onHeroNameChange(e.target.value)} className={`w-full focus:outline-none mb-6 ${themeConfig.input}`} />
                            
                            <label className="block cursor-pointer group relative overflow-hidden rounded-2xl">
                                <div className={`aspect-square border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 ${props.hero ? 'border-green-500/50 bg-green-500/5' : 'border-current opacity-10 group-hover:opacity-30'}`}>
                                    {props.hero ? (
                                        <img src={`data:image/jpeg;base64,${props.hero.base64}`} className="w-full h-full object-cover rounded-xl shadow-2xl transition-transform duration-700 group-hover:scale-110" alt="Hero" />
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-6xl mb-4 grayscale opacity-40">👤</div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Biometric Scan Pending</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                            </label>
                        </div>
                    </div>

                    <div className={`flex flex-col gap-10 ${themeConfig.section}`}>
                        <div className="flex-1 flex flex-col">
                            <div className={themeConfig.label}>02_PRIMARY_CONFLICT</div>
                            <input type="text" placeholder="VILLAIN OR STRUGGLE..." value={props.villainName} onChange={(e) => props.onVillainNameChange(e.target.value)} className={`w-full focus:outline-none mb-8 ${themeConfig.input}`} />
                            <textarea placeholder="Describe the shadow lurking in the path..." value={props.villainDesc} onChange={(e) => props.onVillainDescChange(e.target.value)} className={`w-full flex-1 focus:outline-none resize-none leading-relaxed min-h-[250px] ${themeConfig.input}`} />
                            
                            <button onClick={brainstormNemesis} disabled={isBrainstorming} className="mt-8 flex items-center justify-center gap-4 group">
                                <div className={`w-10 h-10 rounded-full border border-current flex items-center justify-center transition-all group-hover:bg-current group-hover:text-black ${isBrainstorming ? 'animate-spin' : ''}`}>
                                    ⚡
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                                    {isBrainstorming ? 'Syncing...' : 'Neural Brainstorm'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className={`flex flex-col gap-10 ${themeConfig.section}`}>
                        <div>
                            <div className={themeConfig.label}>03_DESTINY_PARAMETERS</div>
                            <div className="mb-10">
                                <p className="text-[9px] font-bold uppercase opacity-30 mb-2">Universe</p>
                                <select value={props.selectedGenre} onChange={(e) => props.onGenreChange(e.target.value)} className={`w-full bg-transparent border-b border-current focus:outline-none font-bold text-xs py-2 cursor-pointer`}>
                                    {GENRES.map(g => <option key={g} value={g} className="text-black">{g}</option>)}
                                </select>
                            </div>
                            
                            <div className="mb-10">
                                <p className="text-[9px] font-bold uppercase opacity-30 mb-2">Mission Briefing</p>
                                <textarea placeholder="Define your ultimate goal..." value={props.customPremise} onChange={(e) => props.onPremiseChange(e.target.value)} className={`w-full h-48 focus:outline-none resize-none leading-relaxed ${themeConfig.input}`} />
                                <button onClick={props.onFeelingLucky} className="mt-4 text-[10px] font-bold opacity-30 hover:opacity-100 uppercase italic tracking-widest transition-opacity">
                                    🎲 Roll Random Destiny
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex justify-center">
                    <button 
                        onClick={props.onLaunch} 
                        disabled={!props.hero || props.isTransitioning}
                        className={`w-full py-10 text-6xl shadow-2xl disabled:opacity-30 disabled:grayscale relative z-10 transition-all ${themeConfig.button}`}
                    >
                        {props.isTransitioning ? 'LINKING...' : 'ASSEMBLE MULTIVERSE!'}
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};
