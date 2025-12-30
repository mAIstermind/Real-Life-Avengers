
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import jsPDF from 'jspdf';
import { INITIAL_PAGES, DECISION_PAGES, GENRES, TONES, LANGUAGES, ComicFace, Beat, Persona, UserPlan } from './types';
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
    "A lonely night shift worker who saves a falling star and gains the power of light.",
    "An office worker who realizes they are the reincarnation of a thunder god after getting shocked by a printer.",
    "A window washer who uses their squeegee as a grappling hook to stop a high-rise robbery.",
    "A pizza delivery person who accidentally delivers a meal to a celestial being and gains cosmic speed.",
    "A janitor at a tech lab who accidentally drinks a glowing 'soda' and gains the ability to talk to machines.",
    "A quiet bookbinder who finds a manual on how to stitch the fabric of space-time back together.",
    "After a devastating fire, a community volunteer is gifted with the ability to heal charred earth with a touch.",
    "A person who lost their voice in an accident finds they can now communicate through world-healing light songs.",
    "A refugee in a new city who discovers their kindness creates protective shields around the vulnerable.",
    "After a flood, a young swimmer gains the ability to breathe underwater and saves a lost treasure of hope.",
    "A veteran recovering from loss finds a stray dog that turns into a winged lion, leading them to save a city.",
    "A social worker who gains empathy so strong it literally melts weapons of war into playground equipment.",
    "A survivor of a storm who can now command the winds to guide lost ships to safety.",
    "A grandmother who knits sweaters that give the wearers courage to face their biggest fears.",
    "A street musician whose music turns grey city streets into vibrant, living parks for a day.",
    "A teacher who inspires their students so much that they all develop minor superpowers to fix their city.",
    "A vet technician who gains the ability to hear the thoughts of all animals, leading a revolution of kindness.",
    "A stray cat rescue worker who is transformed into a feline-humanoid warrior to stop illegal poaching.",
    "An oceanographer who teams up with a telepathic blue whale to stop a deep-sea drilling disaster.",
    "A girl who finds a wounded dragon in her backyard and heals it, becoming the first modern dragon-rider.",
    "A farmhand who saves a flock of birds and is granted the power of flight to protect the migratory paths.",
    "A surfer who stops a tsunami by talking to the spirit of the ocean and pleading for mercy.",
    "A mountain climber who finds a sleeping giant and wakes them to build a bridge for an isolated village.",
    "A scientist who invents 'cloud-seeds of joy' to make it rain clean water over drought-stricken lands.",
    "A forest ranger who discovers they can grow a thousand trees in a single minute to save a dying woods.",
    "A delivery drone that develops a soul and starts delivering medicine to animals in the deep wild.",
    "A garbage collector who figures out how to turn plastic into clean energy using a secret 'Heart-Engine'.",
    "A modern-day blacksmith who forges armor that protects against the shadows of doubt and sadness.",
    "A baker whose bread gives people the ability to understand any language for an hour, ending all conflict.",
    "A clockmaker who can rewind time by five seconds to prevent small accidents and big heartbreaks.",
    "An astronomer who catches a signal from a planet made of pure music and broadcasts it to end a war.",
    "A plumber who discovers a city of tiny, advanced people living in pipes and helps them solve an energy crisis.",
    "A bus driver who drives a magic bus that takes people exactly where they need to be, emotionally.",
    "A graffiti artist whose paintings come to life at night to feed the hungry and protect the lonely.",
    "A photographer who can see and capture the 'true inner glow' of every person they snap a picture of.",
    "A child who finds a lost hero's cape and discovers their grandfather was the world's greatest protector."
];

const App: React.FC = () => {
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue } = useApiKey();

  const [showIntro, setShowIntro] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [customBranding, setCustomBranding] = useState('');

  const [hero, setHeroState] = useState<Persona | null>(null);
  const [friend, setFriendState] = useState<Persona | null>(null);
  const [heroName, setHeroName] = useState("");
  const [friendName, setFriendName] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].code);
  const [customPremise, setCustomPremise] = useState("");
  const [storyTone, setStoryTone] = useState(TONES[0]);
  const [richMode, setRichMode] = useState(true);
  const [storyLength, setStoryLength] = useState(4);
  
  const heroRef = useRef<Persona | null>(null);
  const friendRef = useRef<Persona | null>(null);

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
    console.error("API Error:", msg);
    if (msg.includes('Requested entity was not found') || msg.includes('API_KEY_INVALID') || msg.toLowerCase().includes('permission denied')) {
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
    if (!heroRef.current) throw new Error("No Hero");
    const isFinalPage = pageNum === storyLength;
    const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || "English";
    const relevantHistory = history.filter(p => p.type === 'story' && p.narrative && (p.pageIndex || 0) < pageNum).sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));
    const historyText = relevantHistory.map(p => `[Page ${p.pageIndex}] (Caption: "${p.narrative?.caption || ''}") (Scene: ${p.narrative?.scene})`).join('\n');
    const hName = heroName || "THE HERO";
    let coreDriver = `GENRE: ${selectedGenre}. TONE: ${storyTone}. HERO NAME: ${hName}. MISSION: ${customPremise}`;
    const prompt = `REAL LIFE AVENGERS comic script. PAGE ${pageNum} of ${storyLength}. LANGUAGE: ${langName}. ${coreDriver}\nPREVIOUS:\n${historyText}\nOUTPUT JSON WITH caption, dialogue, scene, focus_char, choices.`;
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
    let promptText = `STYLE: Cinematic Comic art. ${hName} is the star. SCENE: ${beat.scene}. CAPTION: "${beat.caption}".`;
    if (type === 'cover') promptText = `Epic Comic Cover for REAL LIFE AVENGERS featuring ${hName}.`;
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

  const animatePanel = async (faceId: string) => {
    const face = comicFaces.find(f => f.id === faceId);
    if (!face?.imageUrl || face.isLoading) return;
    
    updateFaceState(faceId, { isAnimating: true });
    try {
        const ai = getAI();
        const imgBase64 = face.imageUrl.split(',')[1];
        let op = await ai.models.generateVideos({
            model: MODEL_VIDEO_GEN_NAME,
            prompt: `Cinematic subtle motion for this comic panel: ${face.narrative?.scene || 'epic hero shot'}.`,
            image: { imageBytes: imgBase64, mimeType: 'image/png' },
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
        });
        while (!op.done) {
            await new Promise(r => setTimeout(r, 5000));
            op = await ai.operations.getVideosOperation({ operation: op });
        }
        const videoUrl = `${op.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
        updateFaceState(faceId, { videoUrl, isAnimating: false });
    } catch (e) {
        console.error("Animation failed", e);
        updateFaceState(faceId, { isAnimating: false });
    }
  };

  const updateFaceState = (id: string, updates: Partial<ComicFace>) => {
      setComicFaces(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type']) => {
      const isDecision = DECISION_PAGES.includes(pageNum) && pageNum < storyLength;
      let beat: Beat = { scene: "", choices: [], focus_char: 'other' };
      if (type !== 'cover' && type !== 'back_cover') { beat = await generateBeat(historyRef.current, pageNum % 2 === 0, pageNum, isDecision); }
      updateFaceState(faceId, { narrative: beat, choices: beat.choices, isDecisionPage: isDecision });
      const url = await generateImage(beat, type);
      updateFaceState(faceId, { imageUrl: url, isLoading: false });
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

  const handleDownloadAttempt = () => {
    if (userPlan === 'free') {
      setShowPricing(true);
    } else {
      executeDownload();
    }
  };

  const executeDownload = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [480, 720] });
    comicFaces.filter(f => f.imageUrl).sort((a,b)=>(a.pageIndex||0)-(b.pageIndex||0)).forEach((f, i) => {
        if (i > 0) doc.addPage([480, 720]);
        doc.addImage(f.imageUrl!, 'JPEG', 0, 0, 480, 720);
        
        if (userPlan === 'free') {
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.text('REAL LIFE AVENGERS', 460, 700, { align: 'right' });
        } else if (userPlan === 'agency' && customBranding) {
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.text(customBranding.toUpperCase(), 460, 700, { align: 'right' });
        }
    });
    doc.save(`${heroName || 'Hero'}-Avengers.pdf`);
  };

  const resetApp = () => { setIsStarted(false); setShowSetup(true); setComicFaces([]); setCurrentSheetIndex(0); };

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
            executeDownload();
          }}
          onClose={() => {
            setShowPricing(false);
            executeDownload(); // Proceed with free plan
          }}
        />
      )}
      
      {isStarted && !showSetup && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex gap-4 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
             <button onClick={resetApp} className="text-white font-comic hover:text-yellow-400 pr-4 border-r border-white/20">NEW STORY</button>
             <button onClick={handleDownloadAttempt} disabled={comicFaces.some(f => f.isLoading)} className="bg-red-600 text-white font-comic px-4 py-1 rounded-full disabled:opacity-50">SAVE PDF</button>
          </div>
      )}

      <Setup 
          show={showSetup && !showIntro}
          isTransitioning={isTransitioning}
          hero={hero} friend={friend} heroName={heroName} friendName={friendName}
          selectedGenre={selectedGenre} selectedLanguage={selectedLanguage} customPremise={customPremise}
          richMode={richMode} storyLength={storyLength}
          onHeroUpload={async (file) => { const b = await fileToBase64(file); setHero({ base64: b, desc: "Hero", name: heroName }); }}
          onFriendUpload={async (file) => { const b = await fileToBase64(file); setFriend({ base64: b, desc: "Sidekick", name: friendName }); }}
          onHeroNameChange={setHeroName} onFriendNameChange={setFriendName}
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
          onChoice={(idx, choice) => updateFaceState(`p${idx}`, { resolvedChoice: choice })}
          onOpenBook={() => setCurrentSheetIndex(1)}
          onDownload={handleDownloadAttempt}
          onReset={resetApp}
          onAnimate={animatePanel}
          userPlan={userPlan}
          customBranding={customBranding}
      />
      <LegalFooter />
    </div>
  );
};

export default App;
