
import React, { useState, useEffect } from 'react';
import { Heart, Coffee, ArrowLeft, ExternalLink, Info } from 'lucide-react';
import Button from './Button';

interface DonationPageProps {
  onBack: () => void;
  backLabel?: string;
}

const DonationPage: React.FC<DonationPageProps> = ({ onBack, backLabel = "Back to Editor" }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  const handleDonation = () => {
    window.open('https://buymeachai.ezee.li/clarte', '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center animate-out fade-out duration-700 delay-100">
        <div className="relative">
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="text-pink-500 overflow-visible"
          >
            <path 
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              className="animate-[draw-stroke_1.5s_cubic-bezier(0.4,0,0.2,1)_forwards]"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: 60,
              }}
            />
          </svg>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">
            Establishing Link
          </span>
        </div>

        <style>{`
          @keyframes draw-stroke {
            0% { stroke-dashoffset: 60; fill: transparent; }
            60% { stroke-dashoffset: 0; fill: transparent; }
            100% { stroke-dashoffset: 0; fill: rgba(236, 72, 153, 0.1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/10 rounded-full flex items-center justify-center text-pink-500 shadow-sm border border-pink-100 dark:border-pink-800/30 animate-float">
            <Heart className="w-10 h-10 fill-current" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-designer text-[var(--text-primary)]">
            Keep Clarté Ad-Free
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-md mx-auto">
            Clarté is a free, open-source tool built with precision and privacy at its core. We never run ads or sell your data.
          </p>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-sm mx-auto italic">
            Your contributions help cover hosting costs and support the ongoing development of high-fidelity document tools.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            size="lg" 
            onClick={handleDonation}
            className="w-full py-6 text-[13px] font-bold uppercase tracking-[0.2em] shadow-xl group rounded-[12px]"
          >
            <Coffee className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
            Buy me a chai
            <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
          </Button>

          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            {backLabel}
          </button>
        </div>

        <div className="bg-[var(--bg-sub)] border border-[var(--border-light)] rounded-[12px] p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-[var(--text-muted)]">
            <Info className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Important Note</span>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            Contributions are entirely voluntary. Please ensure the amount is correct before sending, as all transfers are final and non-refundable. Your support is deeply appreciated, but simply using our website is the greatest compliment you can give us.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-8 opacity-30 grayscale pointer-events-none">
          <div className="text-[10px] font-bold uppercase tracking-widest">Minimalism</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">Privacy</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">Precision</div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
