
import React, { useState, useEffect } from 'react';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import { 
  Zap, 
  Layers, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Sun, 
  Moon,
  Monitor,
  Layout,
  Cpu,
  Target,
  Check,
  Heart
} from 'lucide-react';

interface HomePageProps {
  onStart: () => void;
  onGoToSupport: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  hasPlayedIntro: boolean;
  onIntroFinished: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onStart, 
  onGoToSupport,
  theme, 
  setTheme, 
  hasPlayedIntro, 
  onIntroFinished 
}) => {
  const [isHomeLoading, setIsHomeLoading] = useState(!hasPlayedIntro);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (hasPlayedIntro) return;

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setIsHomeLoading(false);
      onIntroFinished();
    }, 2600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [hasPlayedIntro, onIntroFinished]);

  useEffect(() => {
    if (isHomeLoading) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => revealObserver.observe(el));

    return () => {
      revealElements.forEach((el) => revealObserver.unobserve(el));
      revealObserver.disconnect();
    };
  }, [isHomeLoading]);

  if (isHomeLoading) {
    return (
      <div className={`fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center transition-all duration-700 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        <div className="relative flex items-center justify-center">
          {!isExiting && (
            <div className="absolute w-48 h-48 rounded-full border-2 border-indigo-500/40 animate-premium-pulse"></div>
          )}
          
          <div className={`relative z-10 ${isExiting ? 'animate-text-exit' : 'animate-text-entrance'}`}>
            <h1 className="text-6xl font-medium tracking-tighter font-logo text-[var(--text-primary)]">
              Clarté
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 overflow-x-hidden animate-in fade-in duration-1000">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-[var(--border-light)] px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="favicon.png" alt="Clarté Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl font-medium tracking-tighter font-logo">Clarté</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={onGoToSupport}
            className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-pink-500 transition-colors rounded-full hover:bg-[var(--bg-sub)]"
            aria-label="Support Clarté"
          >
            <Heart className="w-5 h-5" />
            <span className="hidden md:inline">Support</span>
          </button>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-400/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 mb-8">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Precision PDF Enhancement</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.05]">
            Precision meets simplicity <br className="hidden md:block" /> in every page.
          </h2>
          
          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
            The professional toolset for enhancing PDF readability and layout. Modify, merge, and export high-fidelity documents effortlessly, directly in your browser.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={onStart} className="rounded-full px-10 group min-w-[200px] transition-transform hover:scale-105">
              Try Clarté
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 text-sm font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:scale-105"
            >
              Explore Features
            </button>
          </div>
        </div>
      </header>

      {/* Features Content */}
      <section className="py-24 px-6 bg-[var(--bg-panel)] border-y border-[var(--border-light)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 reveal">
              <h3 className="text-3xl font-bold tracking-tight">Sophisticated tools, <br /> distilled for ease.</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Clarté handles the complexity of PDF manipulation so you don't have to. Whether it's normalizing colors for readability or synthesizing multi-page layouts, our engine processes every vector with absolute precision.
              </p>
              
              <ul className="space-y-4">
                {[
                  { icon: Target, text: 'Precise layout calibration and spacing' },
                  { icon: Layers, text: 'Seamlessly merge and reorder multiple documents' },
                  { icon: Cpu, text: 'Client-side processing for ultimate speed' },
                  { icon: ShieldCheck, text: 'Private by design — files never leave your device' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 transition-transform hover:translate-x-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-[var(--border-light)] shadow-2xl bg-[var(--bg-main)] reveal">
              <div className="absolute inset-0 p-8 flex flex-col">
                <div className="h-6 w-1/2 shimmer rounded mb-8 opacity-40"></div>
                <div className="flex-1 border-2 border-dashed border-[var(--border-light)] rounded-[12px] flex items-center justify-center relative overflow-hidden">
                   <div className="w-48 h-64 bg-[var(--bg-panel)] rounded-[4px] shadow-lg rotate-[-3deg] border border-[var(--border-light)] p-4 flex flex-col gap-3">
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="h-2 w-3/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="flex-1 bg-indigo-50/50 dark:bg-indigo-900/10 rounded border border-indigo-100 dark:border-indigo-800/30"></div>
                   </div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-[var(--bg-panel)] rounded-[4px] shadow-2xl rotate-[3deg] border border-[var(--border-light)] p-4 flex flex-col gap-3">
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="h-2 w-3/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="flex-1 bg-indigo-500/10 dark:bg-indigo-400/5 rounded border border-indigo-200 dark:border-indigo-800"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-[var(--accent-bg)] rounded-full flex items-center justify-center text-white shadow-xl animate-pulse">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-500 mb-4">Core Capabilities</h3>
            <h4 className="text-4xl font-bold tracking-tight">Everything you need, <br /> exactly where you need it.</h4>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'High-Fidelity Rendering', desc: 'Advanced rasterization ensures every character and vector remains crisp at any scale.', icon: Layout },
              { title: 'Batch Workflow', desc: 'Process dozens of documents simultaneously with unified transformation pipelines.', icon: Layers },
              { title: 'Instant Export', desc: 'Synthesize and download your processed documents in seconds with optimized file sizing.', icon: Zap },
              { title: 'Professional Layouts', desc: 'Define custom density, orientation, and spacing for academic or professional publishing.', icon: Target },
              { title: 'Clean Interface', desc: 'No ads, no accounts, no distractions. Just precision tools in a calm environment.', icon: ShieldCheck },
              { title: 'Color Optimization', desc: 'Invert colors for dark-mode reading or convert to grayscale for eco-friendly printing.', icon: Sun }
            ].map((feature, i) => (
              <div key={i} className="reveal group p-8 rounded-[24px] bg-[var(--bg-panel)] border border-[var(--border-light)] hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h5 className="text-lg font-bold mb-3 tracking-tight">{feature.title}</h5>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[var(--bg-panel)] overflow-hidden">
        <div className="max-w-4xl mx-auto text-center reveal">
          <h3 className="text-3xl font-bold tracking-tight mb-8">Clarté isn't just another PDF tool. <br /> It's a focused creative environment.</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-16 max-w-2xl mx-auto">
            Traditional tools are bloated with features you'll never use. Clarté is designed for the high-frequency tasks you perform daily, optimized for the highest level of efficiency.
          </p>
          
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50 transition-all hover:grayscale-0 hover:opacity-100">
            <div className="flex items-center gap-2 font-logo text-xl">PDF.js Core</div>
            <div className="flex items-center gap-2 font-logo text-xl">React Flow</div>
            <div className="flex items-center gap-2 font-logo text-xl">Vector Synthesis</div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto rounded-[40px] bg-[var(--accent-bg)] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl reveal">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 relative z-10 leading-tight">
            Ready to enhance <br /> your document workflow?
          </h3>
          <p className="text-indigo-100 mb-12 max-w-lg mx-auto relative z-10">
            Join thousands of users who trust Clarté for their precise PDF processing needs. No sign-up required.
          </p>
          
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={onStart} 
            className="rounded-full px-12 bg-white text-indigo-600 hover:bg-indigo-50 border-none relative z-10 shadow-xl transition-transform hover:scale-105"
          >
            Start Editing Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border-light)] px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start reveal">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-medium tracking-tighter font-logo">Clarté</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Precision PDF Tooling</p>
          </div>
          
          <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] reveal">
            <button onClick={onGoToSupport} className="hover:text-[var(--text-primary)] transition-colors">Support Us</button>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Github</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Documentation</a>
          </div>
          
          <p className="text-[10px] text-[var(--text-muted)] reveal">
            &copy; {new Date().getFullYear()} Clarté Labs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
