
import React from 'react';
import { Heart, Coffee, ArrowLeft, ExternalLink } from 'lucide-react';
import Button from './Button';

interface DonationPageProps {
  onBack: () => void;
}

const DonationPage: React.FC<DonationPageProps> = ({ onBack }) => {
  const handleDonation = () => {
    window.open('https://www.buymeacoffee.com/clarte', '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="max-w-xl w-full text-center space-y-10">
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
            Buy me a coffee
            <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
          </Button>

          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Editor
          </button>
        </div>

        <div className="pt-10 flex justify-center gap-8 opacity-30 grayscale pointer-events-none">
          <div className="text-[10px] font-bold uppercase tracking-widest">Minimalism</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">Privacy</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">Precision</div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
