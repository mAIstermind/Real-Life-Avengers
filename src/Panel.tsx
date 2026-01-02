
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ComicFace, UserPlan } from './types';
import { LoadingFX } from './LoadingFX';

interface PanelProps {
    face?: ComicFace;
    allFaces: ComicFace[]; 
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
    onAnimate: (id: string) => void;
    onRegenerate: (id: string) => void;
    userPlan: UserPlan;
    customBranding?: string;
}

export const Panel: React.FC<PanelProps> = ({ face, allFaces, onChoice, onOpenBook, onDownload, onReset, onAnimate, onRegenerate, userPlan, customBranding }) => {
    if (!face) return <div className="w-full h-full bg-[#111] border-2 border-black/20" />;
    const isFullBleed = face.type === 'cover' || face.type === 'back_cover';

    const getWatermarkText = () => {
        if (userPlan === 'individual') return null;
        if (userPlan === 'agency' && customBranding) return customBranding;
        return "Real Life SuperHeroes";
    };

    const watermarkText = getWatermarkText();

    return (
        <div className={`panel-container relative group overflow-hidden ${isFullBleed ? '!p-0 !bg-[#0a0a0a]' : ''}`}>
            <div className="gloss"></div>
            
            {face.isLoading && !face.imageUrl ? (
                <div className="absolute inset-0 z-50 flex flex-col"><LoadingFX /></div>
            ) : null}

            {face.videoUrl ? (
                <video src={face.videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-10" />
            ) : face.imageUrl && (
                <img src={face.imageUrl} alt="Comic panel" className={`panel-image transition-all duration-1000 ${isFullBleed ? '!object-cover' : ''} ${face.isLoading ? 'opacity-40 grayscale blur-md' : 'opacity-100 animate-panel-pop'}`} />
            )}
            
            {!face.isLoading && face.imageUrl && !face.videoUrl && face.type !== 'back_cover' && (
                <div className="absolute top-4 right-4 z-[40] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAnimate(face.id); }}
                        className="bg-black/60 backdrop-blur-md text-yellow-400 p-2 rounded-full hover:scale-110 active:scale-90 transition-transform flex items-center gap-2 px-4 border border-yellow-400/30 font-comic text-[10px]"
                    >
                        {face.isAnimating ? 'MAGIC...' : '✨ ANIMATE'}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRegenerate(face.id); }}
                        className="bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:scale-110 active:scale-90 transition-transform flex items-center gap-2 px-4 border border-white/30 font-comic text-[10px]"
                    >
                        🎨 RE-INK
                    </button>
                </div>
            )}

            {face.imageUrl && !face.isLoading && watermarkText && (
                 <div className="absolute bottom-4 right-6 z-40 font-comic text-white/40 text-[10px] tracking-[4px] pointer-events-none uppercase drop-shadow-sm select-none">
                    {watermarkText}
                </div>
            )}

            {face.type === 'cover' && (
                 <div className="absolute bottom-20 inset-x-0 flex justify-center z-20">
                     <button onClick={(e) => { e.stopPropagation(); onOpenBook(); }}
                      disabled={allFaces.some(f => f.isLoading && (f.pageIndex||0) <= 2)}
                      className="comic-btn bg-red-600 text-white px-10 py-4 text-3xl font-bold animate-bounce disabled:animate-none disabled:bg-gray-400">
                         {allFaces.some(f => f.isLoading && (f.pageIndex||0) <= 2) ? 'INITIATING...' : 'OPEN ISSUE'}
                     </button>
                 </div>
            )}

            {face.type === 'back_cover' && (
                <div className="absolute bottom-20 inset-x-0 flex flex-col items-center gap-6 z-20 px-8 text-center">
                    <div className="bg-black/80 p-6 border-2 border-red-600 rounded-lg shadow-2xl backdrop-blur-md">
                         <h3 className="font-comic text-4xl text-red-600 mb-2 uppercase">Multiverse Stored</h3>
                         <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="comic-btn bg-red-600 text-white w-full py-3 text-xl mb-3">SAVE PDF</button>
                         <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="comic-btn bg-white text-black w-full py-3 text-xl">NEW MISSION</button>
                    </div>
                </div>
            )}
        </div>
    );
}
