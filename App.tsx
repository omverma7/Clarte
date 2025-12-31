
import React, { useState, useEffect, useRef } from 'react';
import { 
  TransformationType, 
  TransformationConfig, 
  LayoutValue,
  ProcessingState,
  FileData
} from './types';
import Sidebar from './components/Sidebar';
import Button from './components/Button';
import HomePage from './components/HomePage';
import ThemeToggle from './components/ThemeToggle';
import DonationPage from './components/DonationPage';
import { processPdfs } from './services/pdfService';
import { useToast } from './components/ToastContext';
import { 
  FileUp, 
  FileText, 
  X, 
  Download, 
  Info,
  Menu,
  Check,
  GripVertical,
  RotateCcw,
  Cpu,
  Layers as LayersIcon,
  Sun,
  Moon,
  Monitor,
  Briefcase,
  Heart
} from 'lucide-react';

const SkeletonLoader: React.FC = () => (
  <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] overflow-hidden animate-pulse">
    <nav className="flex-shrink-0 bg-[var(--bg-panel)] z-50 border-b border-[var(--border-light)] h-16 flex items-center justify-between px-6 md:px-10">
      <div className="flex items-center gap-4">
        <div className="w-24 h-8 shimmer rounded"></div>
      </div>
      <div className="w-10 h-10 shimmer rounded-full"></div>
    </nav>

    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden md:flex w-80 bg-[var(--bg-panel)] border-r border-[var(--border-light)] p-8 flex-col space-y-10">
        <div className="space-y-6">
          <div className="w-32 h-3 shimmer mb-6"></div>
          <div className="w-full h-10 shimmer"></div>
        </div>
        <div className="space-y-6">
          <div className="w-40 h-3 shimmer mb-6"></div>
          <div className="w-full h-16 shimmer"></div>
          <div className="w-full h-16 shimmer"></div>
          <div className="w-full h-48 shimmer"></div>
        </div>
        <div className="w-full h-32 shimmer rounded"></div>
        <div className="w-full h-12 shimmer rounded mt-auto"></div>
      </aside>

      <main className="flex-1 p-6 md:p-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="w-full h-20 shimmer rounded-xl"></div>
          <div className="w-full aspect-[2/1] shimmer rounded-[12px] border-2 border-dashed border-[var(--border-light)] flex flex-col items-center justify-center p-20">
            <div className="w-16 h-16 shimmer rounded-full mb-6"></div>
            <div className="w-48 h-6 shimmer mb-3"></div>
            <div className="w-64 h-4 shimmer"></div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

const ProcessingOverlay: React.FC = () => {
  const [labelIndex, setLabelIndex] = useState(0);
  const labels = [
    "Analyzing Modalities",
    "Calibrating Vectors",
    "Normalizing Luminance",
    "Optimizing Raster",
    "Synthesizing Layout",
    "Finalizing Export"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % labels.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[75vh] min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
        <div className="w-[600px] h-[600px] border border-[var(--text-primary)] rounded-full animate-orbit"></div>
        <div className="absolute w-[400px] h-[400px] border border-[var(--text-primary)] rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '6s' }}></div>
      </div>

      <div className="relative mb-12 animate-float">
        <div className="w-24 h-32 border-[2px] border-[var(--text-primary)] bg-[var(--bg-panel)] rounded-[4px] relative overflow-hidden shadow-2xl flex items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--text-primary)] shadow-[0_0_15px_var(--text-primary)] animate-scan z-10"></div>
          
          <div className="p-4 w-full space-y-3 opacity-30">
            <div className="h-2 w-3/4 bg-[var(--text-primary)] rounded-full"></div>
            <div className="h-2 w-full bg-[var(--text-primary)] rounded-full"></div>
            <div className="h-2 w-5/6 bg-[var(--text-primary)] rounded-full"></div>
            <div className="h-16 w-full border border-[var(--text-primary)] rounded-[2px] flex items-center justify-center">
              <LayersIcon className="w-6 h-6 text-[var(--text-primary)]" />
            </div>
            <div className="h-2 w-1/2 bg-[var(--text-primary)] rounded-full"></div>
          </div>
        </div>

        <div className="absolute -top-4 -right-4 w-8 h-8 bg-[var(--accent-bg)] rounded-full flex items-center justify-center shadow-lg animate-pulse-soft">
          <Cpu className="w-4 h-4 text-[var(--accent-text)]" />
        </div>
      </div>

      <div className="text-center relative z-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--text-primary)] mb-2 transition-all duration-500 min-h-[1em]">
          {labels[labelIndex]}
        </p>
        <div className="flex items-center justify-center gap-1.5 h-1">
          {labels.map((_, i) => (
            <div 
              key={i} 
              className={`h-full rounded-full transition-all duration-500 ${labelIndex === i ? 'w-6 bg-[var(--text-primary)]' : 'w-1 bg-[var(--border-medium)]'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { addToast, removeToast } = useToast();
  
  // Persist current view state
  const [view, setView] = useState<'home' | 'editor' | 'donation'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem('currentView') as 'home' | 'editor' | 'donation') || 'home';
    }
    return 'home';
  });

  // Track the previous view to return to from donation page
  const [returnView, setReturnView] = useState<'home' | 'editor'>('home');
  
  const [editorLoading, setEditorLoading] = useState(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  // Effect to sync view to localStorage
  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = theme === 'dark';
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const defaultPipeline: TransformationConfig[] = [
    { id: '1', type: TransformationType.INVERT, enabled: false },
    { id: '2', type: TransformationType.GRAYSCALE, enabled: false },
    { id: '3', type: TransformationType.LAYOUT, enabled: true },
  ];

  const defaultLayoutConfig: LayoutValue = {
    pagesPerSheet: 1,
    orientation: 'SMART',
    flow: 'ROW',
    showBorders: false,
    spacingMm: 7,
    mergeFiles: false
  };

  const [pipeline, setPipeline] = useState<TransformationConfig[]>(defaultPipeline);
  const [layoutConfig, setLayoutConfig] = useState<LayoutValue>(defaultLayoutConfig);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null
  });
  const [outputBlobs, setOutputBlobs] = useState<Blob[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const resetApp = () => {
    setFiles([]);
    setPipeline(defaultPipeline);
    setLayoutConfig(defaultLayoutConfig);
    setProcessingState({ isProcessing: false, progress: 0, error: null });
    setOutputBlobs([]);
    addToast('success', 'Workspace has been cleared');
  };

  const handleStartEditor = () => {
    setEditorLoading(true);
    setView('editor');
    setTimeout(() => {
      setEditorLoading(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileData[] = (Array.from(e.target.files) as File[]).map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        size: file.size,
        file: file
      }));
      setFiles(prev => [...prev, ...newFiles]);
      addToast('success', `Added ${newFiles.length} file(s)`);
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    setFiles(prev => prev.filter(f => f.id !== id));
    if (fileToRemove) {
      addToast('success', `Removed ${fileToRemove.name}`);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedItemIndex === null) return;
    const remainingItems = files.filter((_, i) => i !== draggedItemIndex);
    const newFiles = [
      ...remainingItems.slice(0, index),
      files[draggedItemIndex],
      ...remainingItems.slice(index)
    ];
    setFiles(newFiles);
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessingState({ isProcessing: true, progress: 0, error: null });
    const toastId = addToast('loading', 'Processing documents...', 0);
    
    try {
      const results = await processPdfs(files.map(f => f.file), pipeline, layoutConfig);
      const blobs = results.map(res => new Blob([res], { type: 'application/pdf' }));
      setOutputBlobs(blobs);
      setProcessingState({ isProcessing: false, progress: 100, error: null });
      removeToast(toastId);
      addToast('success', 'Document rendering complete');
    } catch (err: any) {
      console.error(err);
      setProcessingState({ 
        isProcessing: false, 
        progress: 0, 
        error: err.message || 'Processing failed' 
      });
      removeToast(toastId);
      addToast('error', err.message || 'An unexpected error occurred during processing.');
    }
  };

  const downloadOutput = () => {
    outputBlobs.forEach((blob, index) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Clarté_${files[index]?.name || 'Processed'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    addToast('success', 'Download started successfully');
  };

  if (view === 'home') {
    return (
      <HomePage 
        onStart={handleStartEditor} 
        onGoToSupport={() => {
          setReturnView('home');
          setView('donation');
        }}
        theme={theme} 
        setTheme={setTheme} 
        hasPlayedIntro={hasPlayedIntro}
        onIntroFinished={() => setHasPlayedIntro(true)}
      />
    );
  }

  if (view === 'donation') {
    return (
      <DonationPage 
        onBack={() => setView(returnView)} 
        backLabel={returnView === 'home' ? 'Back to Home' : 'Back to Editor'}
      />
    );
  }

  if (editorLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] overflow-hidden animate-in fade-in duration-700">
      <nav className="flex-shrink-0 bg-[var(--bg-panel)] z-50 border-b border-[var(--border-light)] h-16 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1.5 text-[var(--text-secondary)]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col cursor-pointer select-none group" onClick={() => setView('home')}>
            <h1 className="text-3xl font-medium tracking-tight font-logo leading-none text-[var(--text-primary)] transition-all group-hover:opacity-70">
              Clarté
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setReturnView('editor');
              setView('donation');
            }}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-pink-500 transition-colors rounded-full hover:bg-[var(--bg-sub)]"
            aria-label="Support Clarté"
          >
            <Heart className="w-5 h-5" />
            <span className="hidden md:inline">Support</span>
          </button>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          files={files}
          pipeline={pipeline} 
          setPipeline={setPipeline}
          layoutConfig={layoutConfig}
          setLayoutConfig={setLayoutConfig}
          onProcess={handleProcess}
          onSupport={() => {
            setReturnView('editor');
            setView('donation');
          }}
          isProcessing={processingState.isProcessing}
          hasFiles={files.length > 0}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16">
          {outputBlobs.length === 0 && !processingState.isProcessing ? (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-[14px] p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-800/30">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[var(--text-primary)]">Workspace</h2>
                      <div className={`w-2 h-2 rounded-full transition-all duration-500 ml-1 ${
                        files.length > 0 
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-[var(--text-muted)] font-medium tracking-tight">• {files.length} {files.length === 1 ? 'Document' : 'Documents'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={resetApp}
                  className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Workspace
                </button>
              </div>

              <div 
                className="border-[1.5px] border-[var(--border-medium)] border-dashed rounded-[14px] p-16 md:p-24 flex flex-col items-center justify-center transition-all hover:border-indigo-400/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 cursor-pointer bg-transparent group"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input type="file" id="file-input" className="hidden" multiple accept=".pdf" onChange={handleFileUpload} />
                <div className="w-14 h-14 bg-[var(--bg-panel)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-light)] custom-shadow group-hover:scale-105 transition-transform group-hover:border-indigo-200 dark:group-hover:border-indigo-800">
                  <FileUp className="w-6 h-6 text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Add Documents</h2>
                <p className="text-[var(--text-muted)] text-xs max-w-xs text-center leading-relaxed">Drop your PDF files here or click to browse from your device.</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Sequence Pipeline</h3>
                    <span className="text-[9px] font-medium text-[var(--text-muted)]">Drag to reorder</span>
                  </div>
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div 
                        key={file.id} 
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        className={`bg-[var(--bg-panel)] border p-4 flex items-center justify-between rounded-[10px] shadow-sm transition-all 
                          ${dragOverIndex === index ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-[var(--border-light)]'}`}
                      >
                        <div className="flex items-center gap-4">
                          <GripVertical className="w-4 h-4 text-[var(--border-medium)] cursor-grab active:cursor-grabbing" />
                          <div className="w-9 h-9 bg-[var(--bg-main)] rounded-[6px] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-light)]">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-md tracking-tight">{file.name}</p>
                            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(file.id)} className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : processingState.isProcessing ? (
            <ProcessingOverlay />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-700">
              <div className="max-w-xl w-full flex flex-col items-center text-center p-12 bg-[var(--bg-panel)] rounded-[24px] border border-[var(--border-light)] shadow-sm">
                <h2 className="text-[40px] font-bold font-designer mb-4 text-[var(--text-primary)] tracking-tight leading-tight">
                  Documents Ready
                </h2>
                
                <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-12 max-w-md mx-auto leading-relaxed">
                  The transformation pipeline has successfully finished processing your files. Your high-fidelity documents are prepared for export.
                </p>
                
                <Button 
                  onClick={downloadOutput} 
                  size="lg"
                  className="w-full py-6 text-[13px] font-bold uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(26,115,232,0.15)] mb-10 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-[10px]"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Download All
                </Button>
                
                <button 
                  onClick={() => setOutputBlobs([])}
                  className="group flex items-center gap-2.5 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-60deg] transition-transform duration-300" />
                  Reset Pipeline
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
