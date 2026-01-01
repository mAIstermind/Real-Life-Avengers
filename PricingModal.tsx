
import React, { useState } from 'react';
import { UserPlan } from './types';

interface PricingModalProps {
  onSelect: (plan: UserPlan, customBranding?: string) => void;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onSelect, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('individual');
  const [customBranding, setCustomBranding] = useState('');

  const plans = [
    {
      id: 'free' as UserPlan,
      name: 'Recruit',
      price: '$0',
      tagline: 'Standard Issue',
      features: ['Real Life SuperHeroes Watermark', 'Standard PDF Export', 'AI Storytelling'],
      color: 'bg-gray-100',
      textColor: 'text-gray-800'
    },
    {
      id: 'individual' as UserPlan,
      name: 'Hero',
      price: '$4.99',
      tagline: 'The Clean Slate',
      features: ['Remove All Watermarks', 'High-Res PDF Archive', 'Lifetime Comic Storage'],
      color: 'bg-red-600',
      textColor: 'text-white',
      glow: 'shadow-[0_0_30px_rgba(220,38,38,0.4)]'
    },
    {
      id: 'agency' as UserPlan,
      name: 'Commander',
      price: '$49/qt',
      tagline: 'Empire Builder',
      features: ['Add Your Own Branding', 'Priority Generation', 'Multi-User Command Center'],
      color: 'bg-blue-600',
      textColor: 'text-white',
      glow: 'shadow-[0_0_30px_rgba(37,99,235,0.4)]'
    }
  ];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-white border-[8px] border-black p-6 md:p-10 max-w-5xl w-full rotate-[0.5deg] shadow-[20px_20px_0_black] animate-in zoom-in-95 duration-300 text-black">
        
        <div className="text-center mb-10">
          <h2 className="font-comic text-6xl text-black uppercase tracking-tighter" style={{ textShadow: '4px 4px 0 #DC2626' }}>Upgrade Your Multiverse</h2>
          <p className="font-comic text-xl text-gray-500 uppercase tracking-widest mt-2">Unlock the full power of Real Life SuperHeroes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative cursor-pointer transition-all duration-300 p-6 border-4 border-black group ${plan.id === selectedPlan ? `${plan.color} ${plan.textColor} scale-105 ${plan.glow}` : 'bg-white hover:bg-gray-50 scale-100 text-black'}`}
            >
              {plan.id === selectedPlan && (
                 <div className="absolute -top-5 -right-5 w-12 h-12 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center animate-bounce z-10 text-2xl">
                   ✅
                 </div>
              )}
              
              <h3 className="font-comic text-3xl mb-1 uppercase">{plan.name}</h3>
              <div className="font-comic text-5xl mb-4">{plan.price}</div>
              <p className="font-bold text-xs uppercase tracking-tighter mb-6 opacity-70 italic">{plan.tagline}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-bold uppercase">
                    <span className="mt-1">⚡</span>
                    {feat}
                  </li>
                ))}
              </ul>

              {plan.id === 'agency' && selectedPlan === 'agency' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-bold mb-2 uppercase text-blue-200">Custom Branding Text:</p>
                  <input 
                    type="text" 
                    placeholder="e.g. mAIstermind Studios"
                    value={customBranding}
                    onChange={(e) => setCustomBranding(e.target.value)}
                    className="w-full p-2 bg-white text-black border-2 border-black font-comic text-sm focus:outline-none placeholder-gray-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-[9px] mt-2 opacity-80 leading-tight">
                    * AGENCY users can provide their own API key via the "Command Center" for unlimited generation capacity.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={() => onSelect(selectedPlan, customBranding)} 
            className="comic-btn flex-1 bg-yellow-400 text-black text-3xl py-4 hover:bg-yellow-300 font-bold"
          >
            CONFIRM UPGRADE
          </button>
          <button 
            onClick={onClose} 
            className="comic-btn bg-black text-white px-10 py-4 text-xl"
          >
            NOT NOW
          </button>
        </div>

        <div className="mt-6 text-center text-[10px] text-gray-400 font-mono uppercase tracking-[2px]">
          Secure encryption via The Heroic Network • All major credits accepted
        </div>
      </div>
    </div>
  );
};
