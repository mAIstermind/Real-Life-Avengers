
import React, { useState } from 'react';

export const LegalFooter: React.FC = () => {
  const [modal, setModal] = useState<string | null>(null);

  const Modal = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white border-[6px] border-black p-8 max-w-2xl w-full rotate-[-1deg] shadow-[12px_12px_0_black]">
        <h2 className="font-comic text-4xl text-red-600 mb-6 uppercase border-b-4 border-black inline-block">{title}</h2>
        <div className="font-sans text-black overflow-y-auto max-h-[60vh] space-y-4 text-sm md:text-base">
          {content}
        </div>
        <button onClick={() => setModal(null)} className="comic-btn bg-black text-white px-8 py-2 mt-8 block w-full">CLOSE DOSSIER</button>
      </div>
    </div>
  );

  const contents: Record<string, React.ReactNode> = {
    privacy: (
      <>
        <p><strong>Dossier Sensitivity:</strong> Your biometric data (photos) are processed exclusively for the generation of your heroic multiverse timeline. We do not store, sell, or share your likeness with Hydra or any other malicious third parties.</p>
        <p><strong>Mystical Tracking:</strong> We use minimal cookies to ensure your API session remains secure. Your prompts are strictly used for generative creativity.</p>
      </>
    ),
    terms: (
      <>
        <p><strong>Heroic Code:</strong> By using Real Life Avengers, you agree to use your new mystical powers for good. Harassment, deepfakes of public figures, or non-heroic behavior is grounds for immediate banishment to the Negative Zone.</p>
        <p><strong>Multiverse Liability:</strong> Real Life Avengers is not responsible for any actual incursions or temporal shifts caused by the infinite storytelling engine.</p>
      </>
    ),
    install: (
      <>
        <p><strong>Mobile Deployment:</strong> On iOS (Safari), tap the <strong>Share</strong> button and choose <strong>"Add to Home Screen"</strong>.</p>
        <p><strong>Desktop Deployment:</strong> On Chrome, look for the <strong>Install</strong> icon in the address bar (right side).</p>
        <p>This allows you to access your Heroic Headquarters instantly from your app drawer.</p>
      </>
    ),
    manual: (
      <>
        <p><strong>1. Recruitment:</strong> Upload a clear photo of your Primary Hero and optional Sidekick.</p>
        <p><strong>2. Mission Briefing:</strong> Select a Theme and Tone. Use "I'm Feeling Lucky" for 40+ pre-written destinies.</p>
        <p><strong>3. Assemble:</strong> Hit the Assemble button. Wait for the mystical powers to ink your pages.</p>
        <p><strong>4. Interactive Fate:</strong> Turn pages by clicking. Some pages offer choices that shift your narrative.</p>
        <p><strong>5. Archive:</strong> Download your finished adventure as a high-quality PDF.</p>
      </>
    )
  };

  return (
    <>
      <div className="fixed bottom-14 left-0 right-0 z-[250] flex justify-center gap-4 text-[10px] md:text-xs text-gray-500 font-mono uppercase tracking-widest px-4 text-center">
        <button onClick={() => setModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
        <span className="opacity-20">|</span>
        <button onClick={() => setModal('terms')} className="hover:text-white transition-colors">T&C</button>
        <span className="opacity-20">|</span>
        <button onClick={() => setModal('install')} className="hover:text-white transition-colors">Install App</button>
        <span className="opacity-20">|</span>
        <button onClick={() => setModal('manual')} className="hover:text-white transition-colors">User Manual</button>
      </div>
      {modal && <Modal title={modal.replace('_', ' ')} content={contents[modal]} />}
    </>
  );
};
