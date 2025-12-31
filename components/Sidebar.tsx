
import React, { useState, useEffect } from 'react';
import { TransformationType, TransformationConfig, LayoutPagesPerSheet, LayoutOrientation, LayoutFlow, LayoutValue, FileData } from '../types';
import { 
  Layers, 
  Check,
  Monitor,
  Smartphone,
  Zap,
  LayoutTemplate,
  Grid,
  Plus,
  Minus,
  Files,
  GripVertical,
  Heart
} from 'lucide-react';
import Button from './Button';

interface SidebarProps {
  files: FileData[];
  pipeline: TransformationConfig[];
  setPipeline: (pipeline: TransformationConfig[]) => void;
  layoutConfig: LayoutValue;
  setLayoutConfig: (config: LayoutValue) => void;
  onProcess: () => void;
  onSupport: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  pipeline,
  setPipeline,
  layoutConfig,
  setLayoutConfig,
  onProcess,
  onSupport,
  isProcessing,
  hasFiles,
  isOpen,
  onClose
}) => {
  const [displaySpacing, setDisplaySpacing] = useState<string>(layoutConfig.spacingMm.toString());
  const [draggedPipeIndex, setDraggedPipeIndex] = useState<number | null>(null);
  const [pipeDragOverIndex, setPipeDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setDisplaySpacing(layoutConfig.spacingMm.toString());
  }, [layoutConfig.spacingMm]);

  const toggleTransformation = (id: string) => {
    setPipeline(pipeline.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  // Drag and Drop Logic
  const handlePipeDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPipeIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires data to be set to start a drag
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handlePipeDragEnd = () => {
    setDraggedPipeIndex(null);
    setPipeDragOverIndex(null);
  };

  const handlePipeDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (pipeDragOverIndex !== index) {
      setPipeDragOverIndex(index);
    }
  };

  const handlePipeDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPipeIndex === null || draggedPipeIndex === index) return;
    
    const newPipeline = [...pipeline];
    const [movedItem] = newPipeline.splice(draggedPipeIndex, 1);
    newPipeline.splice(index, 0, movedItem);
    
    setPipeline(newPipeline);
    setDraggedPipeIndex(null);
    setPipeDragOverIndex(null);
  };

  const updateLayout = (updates: Partial<LayoutValue>) => {
    setLayoutConfig({ ...layoutConfig, ...updates });
  };

  const handleSpacingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySpacing(e.target.value);
  };

  const handleSpacingBlur = () => {
    const val = parseFloat(displaySpacing);
    const finalVal = isNaN(val) || val < 1 ? 1 : val;
    setDisplaySpacing(finalVal.toString());
    updateLayout({ spacingMm: finalVal });
  };

  const adjustSpacing = (amount: number) => {
    const newVal = Math.max(1, layoutConfig.spacingMm + amount);
    updateLayout({ spacingMm: newVal });
  };

  const pgsOptions: LayoutPagesPerSheet[] = [1, 2, 4, 6, 8, 10];
  const orientationOptions: { value: LayoutOrientation; label: string; icon: React.ReactNode }[] = [
    { value: 'SMART', label: 'Auto', icon: <Zap className="w-3 h-3" /> },
    { value: 'PORTRAIT', label: 'Portrait', icon: <Smartphone className="w-3 h-3" /> },
    { value: 'LANDSCAPE', label: 'Landscape', icon: <Monitor className="w-3 h-3" /> },
  ];
  const flowOptions: { value: LayoutFlow; label: string; icon: React.ReactNode }[] = [
    { value: 'ROW', label: 'Row Flow', icon: <LayoutTemplate className="w-3 h-3" /> },
    { value: 'COLUMN', label: 'Col Flow', icon: <Grid className="w-3 h-3" /> },
  ];

  const getOptionBtnClass = (isActive: boolean) => 
    `w-full flex items-center justify-center gap-2 py-2 border rounded-[6px] text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border 
     ${isActive 
       ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-bg)] shadow-md' 
       : 'bg-[var(--bg-sub)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--border-light)] active:bg-[var(--border-medium)]'}`;

  const getToggleClass = (isActive: boolean) => 
    `w-full flex items-center justify-start gap-3 px-3 py-2.5 border rounded-[6px] text-[10px] font-bold uppercase tracking-wider transition-all duration-200 
     ${isActive 
       ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-bg)] shadow-md' 
       : 'bg-[var(--bg-sub)] border-transparent text-[var(--text-secondary)] hover:bg-[var(--border-light)] active:bg-[var(--border-medium)]'}`;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed top-16 inset-x-0 bottom-0 bg-[var(--overlay)] backdrop-blur-[2px] z-30 md:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-16 bottom-0 left-0 z-40 w-80 bg-[var(--bg-panel)] border-r border-[var(--border-light)] p-8 flex flex-col overflow-y-auto transform transition-transform duration-300 md:relative md:top-0 md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex-1 space-y-10">
          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <Files className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">Document Strategy</h2>
            </div>
            <button
              onClick={() => updateLayout({ mergeFiles: !layoutConfig.mergeFiles })}
              className={getToggleClass(layoutConfig.mergeFiles)}
            >
              <Plus className={`w-3.5 h-3.5 transition-transform ${layoutConfig.mergeFiles ? 'rotate-45' : ''}`} />
              <span>
                {layoutConfig.mergeFiles ? "Merge PDF's Active" : "Merge PDF's Inactive"}
              </span>
            </button>
          </section>

          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <Layers className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">Processing Pipeline</h2>
            </div>
            
            <div className="space-y-4">
              {pipeline.map((t, index) => (
                <div 
                  key={t.id}
                  draggable
                  onDragStart={(e) => handlePipeDragStart(e, index)}
                  onDragEnd={handlePipeDragEnd}
                  onDragOver={(e) => handlePipeDragOver(e, index)}
                  onDrop={(e) => handlePipeDrop(e, index)}
                  className={`group rounded-[10px] overflow-hidden transition-all duration-300 border ${
                    draggedPipeIndex === index ? 'opacity-40 grayscale' : 
                    pipeDragOverIndex === index ? 'border-blue-500 scale-[1.02] bg-blue-50/10' : 
                    t.enabled ? 'border-blue-400 bg-[var(--bg-panel)] shadow-sm' : 'border-transparent'
                  }`}
                >
                  <div className={`flex items-center gap-3 p-3 transition-colors ${!t.enabled ? 'bg-[var(--bg-sub)] rounded-[6px]' : ''}`}>
                    <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    
                    <label className="flex items-center gap-3 cursor-pointer group/toggle select-none w-full">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={t.enabled}
                        onChange={() => toggleTransformation(t.id)}
                      />
                      <div 
                        className={`w-4 h-4 border rounded-[4px] flex items-center justify-center transition-all ${t.enabled ? 'bg-[var(--accent-bg)] border-[var(--accent-bg)]' : 'border-[var(--border-medium)] bg-white'}`}
                      >
                        {t.enabled && <Check className="w-2.5 h-2.5 text-[var(--accent-text)]" />}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${t.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                        {t.type === TransformationType.INVERT && 'Invert Colors'}
                        {t.type === TransformationType.GRAYSCALE && 'Grayscale'}
                        {t.type === TransformationType.LAYOUT && 'Page Layout'}
                      </span>
                    </label>
                  </div>
                  
                  {t.type === TransformationType.LAYOUT && t.enabled && (
                    <div className="p-4 pt-4 border-t border-[var(--border-light)] space-y-6 bg-white dark:bg-[var(--bg-panel)]">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 block">Density</span>
                        <div className="grid grid-cols-3 gap-2">
                          {pgsOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => updateLayout({ pagesPerSheet: opt })}
                              className={getOptionBtnClass(layoutConfig.pagesPerSheet === opt)}
                            >
                              {opt} {opt === 1 ? 'PG' : 'PGS'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Orientation</span>
                          <div className="space-y-2">
                            {orientationOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateLayout({ orientation: opt.value })}
                                className={getOptionBtnClass(layoutConfig.orientation === opt.value)}
                              >
                                {opt.icon}
                                <span className="text-[9px]">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Ordering</span>
                          <div className="space-y-2">
                            {flowOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateLayout({ flow: opt.value })}
                                className={getOptionBtnClass(layoutConfig.flow === opt.value)}
                              >
                                {opt.icon}
                                <span className="text-[9px]">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 block flex items-center gap-2">
                          Spacing (mm)
                        </span>
                        
                        <div className="flex items-center border border-[var(--border-light)] bg-[var(--bg-sub)] rounded-[8px] p-1">
                          <button onClick={() => adjustSpacing(-1)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input 
                            type="number" 
                            value={displaySpacing}
                            onChange={handleSpacingChange}
                            onBlur={handleSpacingBlur}
                            className="w-full bg-transparent text-[11px] font-bold text-center text-[var(--text-primary)] outline-none"
                          />
                          <button onClick={() => adjustSpacing(1)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => updateLayout({ showBorders: !layoutConfig.showBorders })}
                        className={`w-full py-3 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all ${layoutConfig.showBorders ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : 'bg-[var(--bg-sub)] text-[var(--text-muted)] hover:bg-[var(--border-light)]'}`}
                      >
                        Page Borders
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 space-y-4">
          <Button 
            className="w-full py-4 rounded-[14px] text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10" 
            onClick={onProcess} 
            isLoading={isProcessing}
            disabled={!hasFiles}
          >
            {isProcessing ? 'Processing' : 'Render Document'}
          </Button>
          
          <button 
            onClick={onSupport}
            className="w-full py-3 flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-pink-500 transition-all border border-transparent hover:border-pink-100 dark:hover:border-pink-900/30 rounded-[12px] bg-transparent hover:bg-pink-50/30 dark:hover:bg-pink-900/5"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Support Clarté
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
