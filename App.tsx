
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import jsPDF from 'jspdf';
import { GENRES, TONES, LANGUAGES, ComicFace, Beat, Persona, UserPlan } from './types';
import { Setup } from './Setup';
import { Book } from './Book';
import { useApiKey } from './useApiKey';
import { ApiKeyDialog } from './ApiKeyDialog';
import { Intro } from './Intro';
import { LegalFooter } from './LegalFooter';
import { PricingModal } from './PricingModal';

const MODEL_IMAGE_GEN_NAME = "gemini-3-pro-image-preview";
const MODEL_TEXT_NAME = "gemini-3-pro-preview";
const MODEL_VIDEO_GEN_NAME = "veo-3.1-fast-generate-preview";

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
  const [userPlan, setUserPlan] = useState<UserPlan>(() => (localStorage.getItem('user_plan') as UserPlan) || 'free');
  const [customBranding, setCustomBranding] = useState(() => localStorage.getItem('custom_branding') || '');

  // Persistent State Restoration
  const [heroName, setHeroName] = useState(() => localStorage.getItem('hero_name') || "");
  const [friendName, setFriendName] = useState(() => localStorage.getItem('friend_name') || "");
  const [villainName, setVillainName] = useState(() => localStorage.getItem('villain_name') || "");
  const [villainDesc, setVillainDesc] = useState(() => localStorage.getItem('villain_desc') || "");
  const [selectedGenre, setSelectedGenre] = useState(() => localStorage.getItem('selected_genre') || GENRES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('selected_lang') || LANGUAGES[0].code);
  const [customPremise, setCustomPremise] = useState(() => localStorage.getItem('custom_premise') || "");
  const [richMode, setRichMode] = useState(() => localStorage.getItem('rich_mode') === 'true');
  const [storyLength, setStoryLength] = useState(() => parseInt(localStorage.getItem('story_length') || '4'));

  const [hero, setHeroState] = useState<Persona | null>(() => {
    const saved = localStorage.getItem('hero_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [friend, setFriendState] = useState<Persona | null>(() => {
    const saved = localStorage.getItem('friend_data');
    return saved ? JSON.parse(saved) : null;
  });

  const heroRef = useRef<Persona | null>(hero);
  const friendRef = useRef<Persona | null>(friend);

  // Sync refs and localStorage
  useEffect(() => {
    localStorage.setItem('hero_name', heroName);
    localStorage.setItem('friend_name', friendName);
    localStorage.setItem('villain_name', villainName);
    localStorage.setItem('villain_desc', villainDesc);
    localStorage.setItem('selected_genre', selectedGenre);
    localStorage.setItem('selected_lang', selectedLanguage);
    localStorage.setItem('custom_premise', customPremise);
    localStorage.setItem('rich_mode', String(richMode));
    localStorage.setItem('story_length', String(storyLength));
    localStorage.setItem('user_plan', userPlan);
    localStorage.setItem('custom_branding', customBranding);
    if (hero) localStorage.setItem('hero_data', JSON.stringify(hero));
    if (friend) localStorage.setItem('friend_data', JSON.stringify(friend));
  }, [heroName, friendName, villainName, villainDesc, selectedGenre, selectedLanguage, customPremise, richMode, storyLength, hero, friend, userPlan, customBranding]);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
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
    let styleGuide = "STYLE: Cinematic Comic art. High drama.";
    if (selectedGenre === "Pixar-Style Adventure") styleGuide = "STYLE: Disney/Pixar 3D CGI style.";

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
    if (confirm("Wipe all locally stored hero data?")) {
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
          }}
          onClose={() => setShowPricing(false)}
        />
      )}
      
      {isStarted && !showSetup && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex gap-4 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
             <button onClick={resetApp} className="text-white font-comic hover:text-yellow-400 pr-4 border-r border-white/20">NEW STORY</button>
             <button onClick={() => setShowPricing(true)} className="bg-red-600 text-white font-comic px-4 py-1 rounded-full">EXPORT PDF</button>
          </div>
      )}

      <Setup 
          show={showSetup && !showIntro}
          isTransitioning={isTransitioning}
          hero={hero} friend={friend} heroName={heroName} friendName={friendName}
          villainName={villainName} villainDesc={villainDesc}
          selectedGenre={selectedGenre} selectedLanguage={selectedLanguage} customPremise={customPremise}
          richMode={richMode} storyLength={storyLength}
          onHeroUpload={async (file) => { const b = await fileToBase64(file); setHero({ base64: b, desc: "Hero", name: heroName }); }}
          onFriendUpload={async (file) => { const b = await fileToBase64(file); setFriend({ base64: b, desc: "Sidekick", name: friendName }); }}
          onHeroNameChange={setHeroName} onFriendNameChange={setFriendName}
          onVillainNameChange={setVillainName} onVillainDescChange={setVillainDesc}
          onGenreChange={setSelectedGenre} onLanguageChange={setSelectedLanguage}
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
      <button onClick={clearPersistence} className="fixed bottom-4 left-4 z-[300] text-[8px] text-white/10 hover:text-red-500 font-mono transition-colors">WIPE CACHE</button>
    </div>
  );
};

export default App;
