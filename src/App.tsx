
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import jsPDF from 'jspdf';
import { GENRES, ComicFace, Beat, Persona, UserPlan } from './types';
import { Setup } from './Setup';
import { Book } from './Book';
import { useApiKey } from './useApiKey';
import { ApiKeyDialog } from './ApiKeyDialog';
import { Intro } from './Intro';
import { LegalFooter } from './LegalFooter';
import { PricingModal } from './PricingModal';

const MODEL_IMAGE_GEN_NAME = "gemini-3-pro-image-preview";
const MODEL_TEXT_NAME = "gemini-3-pro-preview";

const FEELING_LUCKY_PROMPTS = [
    "A small-town librarian who discovers they can speak to ghosts and solves long-forgotten mysteries.",
    "A neighborhood street sweeper who gains super-speed and cleans up the city's hidden pollution overnight.",
    "A young student struggling with exams who finds an ancient pen that draws things into reality.",
    "A shy gardener who accidentally creates a forest of oxygen-producing giants in the middle of a desert.",
    "A lonely night shift worker who saves a falling star and gains the power of light."
];

const App: React.FC = () => {
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue } = useApiKey();

  const [showIntro, setShowIntro] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>(() => {
    try {
      return (localStorage.getItem('user_plan') as UserPlan) || 'free';
    } catch { return 'free'; }
  });
  const [customBranding, setCustomBranding] = useState(() => {
     try { return localStorage.getItem('custom_branding') || ''; } catch { return ''; }
  });

  // Persistent State Restoration with Robust Error Handling
  const [heroName, setHeroName] = useState(() => { try { return localStorage.getItem('hero_name') || ""; } catch { return ""; } });
  const [friendName, setFriendName] = useState(() => { try { return localStorage.getItem('friend_name') || ""; } catch { return ""; } });
  const [villainName, setVillainName] = useState(() => { try { return localStorage.getItem('villain_name') || ""; } catch { return ""; } });
  const [villainDesc, setVillainDesc] = useState(() => { try { return localStorage.getItem('villain_desc') || ""; } catch { return ""; } });
  const [selectedGenre, setSelectedGenre] = useState(() => { try { return localStorage.getItem('selected_genre') || GENRES[0]; } catch { return GENRES[0]; } });
  const [customPremise, setCustomPremise] = useState(() => { try { return localStorage.getItem('custom_premise') || ""; } catch { return ""; } });
  const [richMode, setRichMode] = useState(() => { try { return localStorage.getItem('rich_mode') === 'true'; } catch { return false; } });
  const [storyLength, setStoryLength] = useState(() => { try { return parseInt(localStorage.getItem('story_length') || '4'); } catch { return 4; } });

  const [hero, setHeroState] = useState<Persona | null>(() => {
    try {
      const saved = localStorage.getItem('hero_data');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [friend, setFriendState] = useState<Persona | null>(() => {
    try {
      const saved = localStorage.getItem('friend_data');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const heroRef = useRef<Persona | null>(hero);
  const friendRef = useRef<Persona | null>(friend);

  // Sync refs and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hero_name', heroName);
      localStorage.setItem('friend_name', friendName);
      localStorage.setItem('villain_name', villainName);
      localStorage.setItem('villain_desc', villainDesc);
      localStorage.setItem('selected_genre', selectedGenre);
      localStorage.setItem('custom_premise', customPremise);
      localStorage.setItem('rich_mode', String(richMode));
      localStorage.setItem('story_length', String(storyLength));
      localStorage.setItem('user_plan', userPlan);
      localStorage.setItem('custom_branding', customBranding);
      if (hero) localStorage.setItem('hero_data', JSON.stringify(hero));
      if (friend) localStorage.setItem('friend_data', JSON.stringify(friend));
    } catch (e) {
      console.warn("Storage quota exceeded - clearing older history to make room.");
    }
  }, [heroName, friendName, villainName, villainDesc, selectedGenre, customPremise, richMode, storyLength, hero, friend, userPlan, customBranding]);

  const setHero = (p: Persona | null) => { setHeroState(p); heroRef.current = p; };
  const setFriend = (p: Persona | null) => { setFriendState(p); friendRef.current = p; };
  
  const [comicFaces, setComicFaces] = useState<ComicFace[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const historyRef = useRef<ComicFace[]>([]);

  const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

  const handleAPIError = (e: any) => {
    const msg = String(e);
    if (msg.includes('Requested entity was not found') || msg.toLowerCase().includes('permission denied')) {
      setShowApiKeyDialog(true);
    }
  };

  // Safe Image Resizing
  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
          } else {
            if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const generateBeat = async (history: ComicFace[], isRightPage: boolean, pageNum: number, isDecisionPage: boolean): Promise<Beat> => {
    const relevantHistory = history.filter(p => p.type === 'story' && p.narrative && (p.pageIndex || 0) < pageNum).sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));
    const historyText = relevantHistory.map(p => `[Page ${p.pageIndex}] (Caption: "${p.narrative?.caption || ''}") (Scene: ${p.narrative?.scene})`).join('\n');
    const hName = heroName || "THE HERO";
    const vInfo = villainName ? `VILLAIN: ${villainName} (${villainDesc || 'A menacing force'}).` : 'VILLAIN: A mysterious internal challenge.';
    
    let coreDriver = `GENRE: ${selectedGenre}. HERO: ${hName}. ${vInfo} MISSION: ${customPremise}`;
    const prompt = `REAL LIFE SUPERHEROES comic script. PAGE ${pageNum} of ${storyLength}. ${coreDriver}\nPREVIOUS:\n${historyText}\nOUTPUT JSON WITH caption, dialogue, scene, focus_char (hero/friend/villain/other), choices.`;
    
    try {
        const ai = getAI();
        const res = await ai.models.generateContent({ 
          model: MODEL_TEXT_NAME, 
          contents: prompt, 
          config: { 
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                caption: { type: Type.STRING },
                dialogue: { type: Type.STRING },
                scene: { type: Type.STRING },
                focus_char: { type: Type.STRING },
                choices: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['caption', 'dialogue', 'scene', 'focus_char', 'choices'],
            }
          } 
        });
        const parsed = JSON.parse(res.text || "{}");
        if (!isDecisionPage) parsed.choices = [];
        return parsed as Beat;
    } catch (e) {
        handleAPIError(e);
        return { caption: "...", scene: "Action scene.", focus_char: 'hero', choices: [] };
    }
  };

  const generateImage = async (beat: Beat, type: ComicFace['type']): Promise<string> => {
    const contents: any[] = [];
    if (heroRef.current?.base64) {
        contents.push({ text: "REF HERO:" }, { inlineData: { mimeType: 'image/jpeg', data: heroRef.current.base64 } });
    }
    const hName = heroName || "THE HERO";
    let styleGuide = "STYLE: Cinematic Comic art. High drama. 4K detail.";
    if (selectedGenre === "Pixar-Style Adventure") styleGuide = "STYLE: Disney/Pixar 3D CGI style. Soft lighting.";

    let promptText = `${styleGuide} ${hName} is the star. SCENE: ${beat.scene}.`;
    contents.push({ text: promptText });
    
    try {
        const ai = getAI();
        const res = await ai.models.generateContent({
          model: MODEL_IMAGE_GEN_NAME,
          contents: contents,
          config: { imageConfig: { aspectRatio: '3:4' } }
        });
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
    } catch (e) { handleAPIError(e); return ''; }
  };

  const handleExportPDF = () => {
    if (comicFaces.length === 0) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [400, 600]
    });

    const sortedFaces = [...comicFaces].sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    sortedFaces.forEach((face, index) => {
      if (face.imageUrl) {
        if (index > 0) doc.addPage([400, 600], 'portrait');
        
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 400, 600, 'F');

        const base64Data = face.imageUrl.split(',')[1];
        try {
          doc.addImage(base64Data, 'JPEG', 0, 0, 400, 600, undefined, 'FAST');
        } catch (e) {
          console.error("PDF Image Compression Error", e);
        }
        
        if (userPlan === 'free') {
           doc.setFillColor(0, 0, 0, 0.4);
           doc.rect(260, 580, 140, 20, 'F');
           doc.setTextColor(255, 255, 255);
           doc.setFontSize(8);
           doc.text("REAL LIFE SUPERHEROES AI", 270, 592);
        } else if (userPlan === 'agency' && customBranding) {
           doc.setFillColor(0, 0, 0, 0.6);
           doc.rect(0, 580, 400, 20, 'F');
           doc.setTextColor(255, 255, 255);
           doc.setFontSize(8);
           doc.text(customBranding.toUpperCase(), 200, 592, { align: 'center' });
        }

        if (face.type === 'story' && face.narrative && face.narrative.caption) {
          doc.setFillColor(255, 255, 255, 0.95);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1.5);
          doc.rect(30, 30, 340, 45, 'FD');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.text(face.narrative.caption, 40, 48, { maxWidth: 320 });
        }
      }
    });

    doc.save(`${heroName.replace(/\s+/g, '_') || 'Hero'}_Multiverse_Comic.pdf`);
  };

  const launchStory = async () => {
    if (!heroRef.current) { alert("Recruit a hero first!"); return; }
    const hasKey = await validateApiKey();
    if (!hasKey) return;
    setIsTransitioning(true);
    const faces: ComicFace[] = [
        { id: 'cover', type: 'cover', choices: [], isLoading: true, pageIndex: 0 },
        ...Array.from({ length: storyLength }, (_, i) => ({ id: `p${i+1}`, type: 'story' as const, choices: [], isLoading: true, pageIndex: i+1 })),
        { id: 'back', type: 'back_cover', choices: [], isLoading: true, pageIndex: storyLength+1 }
    ];
    setComicFaces(faces);
    historyRef.current = faces;
    generateSinglePage('cover', 0, 'cover');
    setTimeout(async () => {
        setIsStarted(true);
        setShowSetup(false);
        setIsTransitioning(false);
        for (let i = 1; i <= storyLength; i++) await generateSinglePage(`p${i}`, i, 'story');
        generateSinglePage('back', storyLength+1, 'back_cover');
    }, 1100);
  };

  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type']) => {
    let beat: Beat = { scene: "", choices: [], focus_char: 'other' };
    if (type !== 'cover' && type !== 'back_cover') { beat = await generateBeat(historyRef.current, pageNum % 2 === 0, pageNum, false); }
    updateFaceState(faceId, { narrative: beat });
    const url = await generateImage(beat, type);
    updateFaceState(faceId, { imageUrl: url, isLoading: false });
  };

  const updateFaceState = (id: string, updates: Partial<ComicFace>) => {
      setComicFaces(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const resetApp = () => { 
    if (confirm("Reset current multiverse progress?")) {
        setIsStarted(false); 
        setShowSetup(true); 
        setComicFaces([]); 
        setCurrentSheetIndex(0); 
    }
  };

  const clearPersistence = () => {
    if (confirm("Wipe all locally stored hero data? This is the best way to fix errors.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="comic-scene">
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />}
      {showPricing && (
        <PricingModal 
          onSelect={(plan, branding) => {
            setUserPlan(plan);
            if (branding) setCustomBranding(branding);
            setShowPricing(false);
            setTimeout(() => handleExportPDF(), 600);
          }}
          onClose={() => setShowPricing(false)}
        />
      )}
      
      {isStarted && !showSetup && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex gap-4 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
             <button onClick={resetApp} className="text-white font-comic hover:text-yellow-400 pr-4 border-r border-white/20 uppercase tracking-widest text-sm">New Issue</button>
             <button onClick={() => setShowPricing(true)} className="bg-red-600 text-white font-comic px-6 py-1 rounded-full hover:bg-red-500 transition-colors uppercase tracking-widest text-sm">Download PDF</button>
          </div>
      )}

      <Setup 
          show={showSetup && !showIntro}
          isTransitioning={isTransitioning}
          hero={hero} friend={friend} heroName={heroName} friendName={friendName}
          villainName={villainName} villainDesc={villainDesc}
          selectedGenre={selectedGenre} selectedLanguage={''} customPremise={customPremise}
          richMode={richMode} storyLength={storyLength}
          onHeroUpload={async (file) => { const b = await resizeImage(file, 512, 512); setHero({ base64: b, desc: "Hero", name: heroName }); }}
          onFriendUpload={async (file) => { const b = await resizeImage(file, 512, 512); setFriend({ base64: b, desc: "Sidekick", name: friendName }); }}
          onHeroNameChange={setHeroName} onFriendNameChange={setFriendName}
          onVillainNameChange={setVillainName} onVillainDescChange={setVillainDesc}
          onGenreChange={setSelectedGenre} onLanguageChange={() => {}}
          onPremiseChange={setCustomPremise} onRichModeChange={setRichMode}
          onStoryLengthChange={setStoryLength} onFeelingLucky={() => setCustomPremise(FEELING_LUCKY_PROMPTS[Math.floor(Math.random()*FEELING_LUCKY_PROMPTS.length)])}
          onLaunch={launchStory}
      />
      <Book 
          comicFaces={comicFaces}
          currentSheetIndex={currentSheetIndex}
          isStarted={isStarted}
          isSetupVisible={showSetup && !isTransitioning}
          onSheetClick={(i) => {
              if (i < currentSheetIndex) setCurrentSheetIndex(i);
              else if (i === currentSheetIndex && comicFaces.find(f => f.pageIndex === i)?.imageUrl) setCurrentSheetIndex(i + 1);
          }}
          onChoice={() => {}}
          onOpenBook={() => setCurrentSheetIndex(1)}
          onDownload={() => setShowPricing(true)}
          onReset={resetApp}
          onAnimate={() => {}}
          onRegenerate={() => {}}
          userPlan={userPlan}
          customBranding={customBranding}
      />
      <LegalFooter />
      <button onClick={clearPersistence} className="fixed bottom-4 left-4 z-[300] text-[10px] text-white/20 hover:text-red-500 font-mono transition-colors uppercase tracking-[2px]">Reset Demo Cache</button>
    </div>
  );
};

export default App;
