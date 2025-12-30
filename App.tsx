import React, { useState, useEffect } from 'react';
import { 
  TransformationType, 
  TransformationConfig, 
  LayoutValue,
  ProcessingState,
  FileData
} from './types';
import Sidebar from './components/Sidebar';
import Button from './components/Button';
import { processPdfs } from './services/pdfService';
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
  FileCheck,
  Cpu,
  Layers as LayersIcon,
  Sun,
  Moon
} from 'lucide-react';

const SkeletonLoader: React.FC = () => (
  <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] overflow-hidden animate-pulse">
    {/* Header Skeleton */}
    <nav className="flex-shrink-0 bg-[var(--bg-panel)] z-50 border-b border-[var(--border-light)] h-16 flex items-center justify-between px-6 md:px-10">
      <div className="flex items-center gap-4">
        <div className="w-24 h-6 shimmer rounded"></div>
      </div>
      <div className="w-10 h-10 shimmer rounded-full"></div>
    </nav>

    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar Skeleton */}
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

      {/* Main Content Skeleton */}
      <main className="flex-1 p-6 md:p-16">
        <div className="max-w-4xl mx-auto">
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [files, setFiles] = useState<FileData[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Simulate system initialization
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
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
  const [showToast, setShowToast] = useState(false);

  const resetApp = () => {
    setFiles([]);
    setPipeline(defaultPipeline);
    setLayoutConfig(defaultLayoutConfig);
    setProcessingState({ isProcessing: false, progress: 0, error: null });
    setOutputBlobs([]);
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
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
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
    try {
      const results = await processPdfs(files.map(f => f.file), pipeline, layoutConfig);
      const blobs = results.map(res => new Blob([res], { type: 'application/pdf' }));
      setOutputBlobs(blobs);
      setProcessingState({ isProcessing: false, progress: 100, error: null });
    } catch (err: any) {
      console.error(err);
      setProcessingState({ 
        isProcessing: false, 
        progress: 0, 
        error: err.message || 'An unexpected error occurred during processing.' 
      });
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
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (isInitializing) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] overflow-hidden animate-in fade-in duration-700">
      <nav className="flex-shrink-0 bg-[var(--bg-panel)] z-50 border-b border-[var(--border-light)] h-16 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1.5 text-[var(--text-secondary)]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col cursor-pointer select-none" onClick={resetApp}>
            <h1 className="text-lg font-bold tracking-[0.05em] uppercase font-designer leading-none">Clarté</h1>
            <p className="text-[8px] tracking-[0.25em] font-extrabold uppercase text-[var(--text-muted)] mt-1.5">Precision PDF Tool</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sub)] rounded-full transition-all"
          >
            {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          </button>
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
          isProcessing={processingState.isProcessing}
          hasFiles={files.length > 0}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-16">
          {processingState.error && (
            <div className="mb-8 p-4 bg-red-900/10 border border-red-900/30 text-red-500 text-sm flex items-center gap-4 rounded-[8px]">
              <Info className="w-4 h-4" />
              {processingState.error}
            </div>
          )}

          {outputBlobs.length === 0 && !processingState.isProcessing ? (
            <div className="max-w-4xl mx-auto">
              <div 
                className="border-2 border-[var(--border-medium)] border-dashed rounded-[12px] p-20 flex flex-col items-center justify-center transition-all hover:border-[var(--text-primary)] hover:bg-[var(--bg-panel)] cursor-pointer bg-[var(--bg-sub)]"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input type="file" id="file-input" className="hidden" multiple accept=".pdf" onChange={handleFileUpload} />
                <FileUp className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                <h2 className="text-xl font-medium mb-2">Add Documents</h2>
                <p className="text-[var(--text-secondary)] text-sm">Drop PDF files here to begin transformations.</p>
              </div>

              {files.length > 0 && (
                <div className="mt-12 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Sequence</h3>
                  {files.map((file, index) => (
                    <div 
                      key={file.id} 
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      className={`bg-[var(--bg-panel)] border p-4 flex items-center justify-between rounded-[8px] custom-shadow transition-all 
                        ${dragOverIndex === index ? 'border-[var(--text-primary)] bg-[var(--bg-sub)]' : 'border-[var(--border-light)]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-[var(--border-medium)] cursor-grab" />
                        <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(file.id)} className="p-2 text-[var(--text-muted)] hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : processingState.isProcessing ? (
            <ProcessingOverlay />
          ) : (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-[var(--bg-sub)] rounded-full flex items-center justify-center mb-8">
                <FileCheck className="w-10 h-10 text-[var(--text-primary)]" />
              </div>
              <h2 className="text-3xl font-bold font-designer mb-4">Documents Ready</h2>
              <p className="text-[var(--text-secondary)] mb-10">Transformation pipeline complete. Your enhanced files are ready for export.</p>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setOutputBlobs([])}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={downloadOutput} className="px-12">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-center-popup">
          <div className="bg-[var(--accent-bg)] text-[var(--accent-text)] px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
            <Check className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">Download Complete</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;