
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
      {/* Background Ambience */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
        <div className="w-[600px] h-[600px] border border-[var(--text-primary)] rounded-full animate-orbit"></div>
        <div className="absolute w-[400px] h-[400px] border border-[var(--text-primary)] rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '6s' }}></div>
      </div>

      {/* Main Animation Core */}
      <div className="relative mb-12 animate-float">
        <div className="w-24 h-32 border-[2px] border-[var(--text-primary)] bg-[var(--bg-panel)] rounded-[4px] relative overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--text-primary)] shadow-[0_0_15px_var(--text-primary)] animate-scan z-10"></div>
          
          {/* Abstract Content Blocks */}
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

        {/* Orbiting Tech Points */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-[var(--accent-bg)] rounded-full flex items-center justify-center shadow-lg animate-pulse-soft">
          <Cpu className="w-4 h-4 text-[var(--accent-text)]" />
        </div>
      </div>

      {/* Textual Feedback */}
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

      {/* Floating Status Codes */}
      <div className="absolute bottom-10 left-10 hidden lg:block opacity-20">
        <p className="text-[10px] font-mono leading-relaxed text-[var(--text-primary)]">
          SYS_RENDER_START<br />
          ALLOC_BUFFER_0x291<br />
          OPTIMIZE_PIPELINE_V3<br />
          STATE_ACTIVE
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
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
  
  const [exportHistory, setExportHistory] = useState<Record<string, number>>({});

  const resetApp = () => {
    setFiles([]);
    setPipeline(defaultPipeline);
    setLayoutConfig(defaultLayoutConfig);
    setProcessingState({ isProcessing: false, progress: 0, error: null });
    setOutputBlobs([]);
    setIsMenuOpen(false);
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
    setOutputBlobs([]);

    try {
      const results = await processPdfs(
        files.map(f => f.file),
        pipeline,
        layoutConfig
      );
      
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
    if (outputBlobs.length === 0 || files.length === 0) return;

    const newHistory = { ...exportHistory };

    outputBlobs.forEach((blob, index) => {
      let finalName = "";
      let historyKey = "";

      if (layoutConfig.mergeFiles) {
        historyKey = "Merged_Clarte";
        const currentCount = newHistory[historyKey] || 0;
        finalName = currentCount > 0 ? `Merged_Clarté_${currentCount}.pdf` : "Merged_Clarté.pdf";
      } else {
        const fileRef = files[index];
        const originalName = fileRef?.name || 'Clarte_Output';
        const baseNameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
        const sanitizedBase = baseNameWithoutExt.replace(/\s+/g, '_');
        
        historyKey = sanitizedBase;
        const currentCount = newHistory[historyKey] || 0;
        
        finalName = `${sanitizedBase}_Clarte`;
        if (currentCount > 0) {
          finalName += `_${currentCount}`;
        }
        finalName += ".pdf";
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      
      setTimeout(() => {
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, index * 200);

      newHistory[historyKey] = (newHistory[historyKey] || 0) + 1;
    });

    setExportHistory(newHistory);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const WorkspaceStatus = () => (
    <div className="flex items-center gap-4 lg:gap-8">
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Workspace</span>
        <div className="h-3 w-[1px] bg-[var(--border-light)]"></div>
      </div>

      {files.length > 0 ? (
        <span className="text-xs md:text-[13px] font-medium text-[var(--text-secondary)] truncate">
          {files.length} PDF{files.length > 1 ? 's' : ''} <span className="text-[var(--text-muted)] mx-1 hidden md:inline">•</span> <span className="hidden md:inline">Ready</span>
        </span>
      ) : (
        <span className="text-xs md:text-[13px] font-medium text-[var(--text-muted)] truncate">No documents active</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] overflow-hidden text-[var(--text-primary)]">
      {/* Main Navbar - Highest Priority (z-50) */}
      <nav className="flex-shrink-0 bg-[var(--bg-panel)]/80 backdrop-blur-md z-50 border-b border-[var(--border-light)] h-16 flex items-center justify-between">
        <div className="flex items-center h-full">
          {/* Branding Section */}
          <div className="flex items-center gap-4 pl-6 md:pl-10 h-full md:w-80 relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sub)] rounded-md transition-all flex-shrink-0"
              aria-label={isMenuOpen ? "Close settings" : "Open settings"}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div 
              className="flex flex-row items-end gap-2.5 md:flex-col md:items-start md:justify-center md:gap-0 cursor-pointer select-none group"
              onClick={resetApp}
              title="Reset Application"
            >
              <h1 className="text-base md:text-lg font-bold tracking-[0.05em] uppercase text-designer leading-none group-hover:text-[var(--text-primary)] transition-colors">Clarté</h1>
              <p className="hidden md:block text-[var(--text-muted)] text-[6px] md:text-[8px] tracking-[0.25em] font-extrabold uppercase leading-none pb-[1px] md:pb-0 md:mt-1.5 group-hover:text-[var(--text-secondary)] transition-colors">Precision PDF Tool</p>
            </div>
            
            {/* Separation Line (Desktop only) */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-6 w-[1px] bg-[var(--border-light)]"></div>
          </div>

          {/* Desktop Status (Beside Branding) */}
          <div className="hidden md:block px-8">
            <WorkspaceStatus />
          </div>
        </div>
        
        {/* Theme Toggle only - Top Navbar Export Button Removed per User Request */}
        <div className="flex items-center pr-6 md:pr-10">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sub)] rounded-full transition-all"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Workspace Status Sub-Panel - Lowest Priority (z-20) */}
      <div className="md:hidden h-10 border-b border-[var(--border-light)] bg-[var(--bg-sub)]/50 flex items-center px-6 flex-shrink-0 relative z-20">
        <WorkspaceStatus />
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 lg:p-16">
            {processingState.error && (
              <div className="mb-8 p-4 bg-red-950/10 border border-red-900/30 text-red-500 text-xs md:text-sm flex items-center gap-4 rounded-[8px] backdrop-blur-sm">
                <span className="flex-shrink-0"><Info className="w-4 h-4" /></span>
                {processingState.error}
              </div>
            )}

            {outputBlobs.length === 0 && !processingState.isProcessing ? (
              <div className="max-w-4xl mx-auto">
                <div 
                  className="relative group border border-[var(--border-medium)] border-dashed rounded-[12px] p-12 md:p-20 flex flex-col items-center justify-center transition-all hover:border-[var(--text-primary)] hover:bg-[var(--bg-panel)] cursor-pointer bg-[var(--bg-sub)] custom-shadow"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input 
                    type="file" 
                    id="file-input" 
                    className="hidden" 
                    multiple 
                    accept=".pdf" 
                    onChange={handleFileUpload}
                  />
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                    <FileUp className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                  </div>
                  <h2 className="text-lg md:text-xl font-medium mb-2 tracking-tight">Add Documents</h2>
                  <p className="text-[var(--text-secondary)] text-xs md:text-sm text-center max-w-xs leading-relaxed">
                    Drop your PDF files here to begin transformations.
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="mt-12 space-y-4">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Document Sequence</span>
                      <span className="text-[9px] text-[var(--text-muted)] italic">Drag items to reorder merge priority</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3.5">
                      {files.map((file, index) => (
                        <div 
                          key={file.id} 
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop(index)}
                          className={`bg-[var(--bg-panel)] border p-3.5 flex items-center justify-between rounded-[8px] custom-shadow transition-all duration-200 
                            ${dragOverIndex === index ? 'border-[var(--text-primary)] bg-[var(--bg-sub)] -translate-y-0.5' : 'border-[var(--border-light)] hover:border-[var(--border-medium)]'}
                            ${draggedItemIndex === index ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                          `}
                        >
                          <div className="flex items-center gap-5 min-w-0">
                            <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--border-medium)] hover:text-[var(--text-secondary)] transition-colors">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="w-9 h-9 bg-[var(--bg-sub)] border border-[var(--border-light)] flex items-center justify-center flex-shrink-0 rounded-[6px]">
                              <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium truncate text-[var(--text-primary)]">{file.name}</p>
                              <div className="flex items-center gap-4">
                                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <span className="text-[var(--border-light)] text-[10px]">•</span>
                                <p className="text-[9px] text-[var(--text-secondary)] font-medium">Position: {index + 1}</p>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sub)] rounded-md transition-all"
                            title="Remove file"
                          >
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
              <div className="flex flex-col space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xs md:text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--text-primary)] mb-1">
                      {layoutConfig.mergeFiles ? 'MERGED DOCUMENT READY' : 'INDIVIDUAL DOCUMENTS READY'}
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-[var(--text-secondary)] font-medium">Render complete for the current pipeline state</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Button variant="outline" size="sm" onClick={() => {
                       setOutputBlobs([]);
                     }} className="text-[11px] h-9 px-6 font-bold uppercase tracking-widest">
                       Edit Files
                     </Button>
                  </div>
                </div>

                <div className="h-[75vh] min-h-[500px] bg-[var(--bg-panel)] border border-[var(--border-medium)] custom-shadow relative overflow-hidden flex flex-col items-center justify-center p-8 rounded-[12px] animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-[var(--bg-sub)] rounded-full flex items-center justify-center mb-8">
                    <FileCheck className="w-10 h-10 text-[var(--text-primary)]" />
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-4 font-designer">
                    Files are ready to be Downloaded
                  </h2>
                  
                  <p className="text-[var(--text-secondary)] text-sm text-center max-w-sm mb-10 leading-relaxed">
                    Your document transformations have been applied successfully. You can now download the processed {layoutConfig.mergeFiles ? 'file' : 'files'}.
                  </p>

                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={downloadOutput} 
                    className="rounded-full px-12 py-4 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    <span className="text-[13px] font-bold uppercase tracking-widest">Export All Files</span>
                  </Button>

                  <button 
                    onClick={() => setOutputBlobs([])}
                    className="mt-6 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-[11px] font-bold uppercase tracking-widest"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Discard and Restart
                  </button>

                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--border-light)]"></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--border-light)]"></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--border-light)]"></div>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 flex items-center gap-4">
                     <div className="bg-[var(--bg-sub)] text-[var(--text-secondary)] text-[9px] px-4 py-2 rounded-full uppercase tracking-[0.2em] font-bold border border-[var(--border-light)] pointer-events-none">
                      HARDWARE ACCELERATION ACTIVE
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showToast && (
        <>
          <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-[6px] z-[99] transition-opacity duration-500" />
          <div className="fixed top-1/2 left-1/2 z-[100] animate-center-popup pointer-events-none">
            <div className="bg-[var(--accent-bg)] text-[var(--accent-text)] px-12 py-8 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-[var(--border-light)] backdrop-blur-xl flex flex-col items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-text)]/10 border border-[var(--accent-text)]/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-[var(--accent-text)]" />
              </div>
              <span className="font-designer text-[14px] md:text-[15px] font-semibold tracking-[0.05em]">
                Thanks for using Clarté
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
