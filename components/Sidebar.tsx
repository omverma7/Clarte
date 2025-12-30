
import React, { useState, useEffect } from 'react';
import { TransformationType, TransformationConfig, LayoutPagesPerSheet, LayoutOrientation, LayoutFlow, LayoutValue, FileData } from '../types';
import { 
  Layers, 
  Check,
  ChevronUp,
  ChevronDown,
  Monitor,
  Smartphone,
  Zap,
  LayoutTemplate,
  Grid,
  Maximize,
  X,
  Plus,
  Minus,
  Files
} from 'lucide-react';
import Button from './Button';

interface SidebarProps {
  files: FileData[];
  pipeline: TransformationConfig[];
  setPipeline: (pipeline: TransformationConfig[]) => void;
  layoutConfig: LayoutValue;
  setLayoutConfig: (config: LayoutValue) => void;
  onProcess: () => void;
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
  isProcessing,
  hasFiles,
  isOpen,
  onClose
}) => {
  const [displaySpacing, setDisplaySpacing] = useState<string>(layoutConfig.spacingMm.toString());

  useEffect(() => {
    setDisplaySpacing(layoutConfig.spacingMm.toString());
  }, [layoutConfig.spacingMm]);

  const toggleTransformation = (id: string) => {
    setPipeline(pipeline.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPipeline = [...pipeline];
    const temp = newPipeline[index];
    newPipeline[index] = newPipeline[index - 1];
    newPipeline[index - 1] = temp;
    setPipeline(newPipeline);
  };

  const moveDown = (index: number) => {
    if (index === pipeline.length - 1) return;
    const newPipeline = [...pipeline];
    const temp = newPipeline[index];
    newPipeline[index] = newPipeline[index + 1];
    newPipeline[index + 1] = temp;
    setPipeline(newPipeline);
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

  const handleSpacingKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSpacingBlur();
      (e.target as HTMLInputElement).blur();
    }
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

  const sidebarClasses = `
    fixed top-16 bottom-0 left-0 z-40 w-80 bg-[var(--bg-panel)] border-r border-[var(--border-light)] p-8 flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out
    md:relative md:top-0 md:translate-x-0
    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
  `;

  const getToggleClass = (isActive: boolean) => 
    `w-full flex items-center justify-center gap-2 px-2.5 py-2.5 border rounded-[6px] text-[10px] transition-all duration-200 
     ${isActive 
       ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-bg)] hover:opacity-90 active:scale-[0.98] shadow-lg' 
       : 'bg-[var(--bg-sub)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:bg-[var(--border-light)] active:bg-[var(--border-medium)]'}`;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed top-16 inset-x-0 bottom-0 bg-[var(--overlay)] backdrop-blur-[2px] z-30 md:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
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
              <Plus className={`w-3 h-3 transition-transform ${layoutConfig.mergeFiles ? 'rotate-45' : ''}`} />
              <span className="font-semibold tracking-[0.05em]">
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
                  className={`group border rounded-[8px] p-4 transition-all duration-300 ${t.enabled ? 'border-[var(--border-medium)] bg-[var(--bg-sub)] shadow-md' : 'border-[var(--border-light)] bg-[var(--bg-panel)] opacity-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-3 cursor-pointer group/toggle select-none">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={t.enabled}
                        onChange={() => toggleTransformation(t.id)}
                      />
                      <div 
                        className={`w-4 h-4 border rounded-[4px] flex items-center justify-center transition-all ${t.enabled ? 'bg-[var(--accent-bg)] border-[var(--accent-bg)]' : 'border-[var(--border-medium)] bg-[var(--bg-panel)]'}`}
                      >
                        {t.enabled && <Check className="w-2.5 h-2.5 text-[var(--accent-text)]" />}
                      </div>
                      <span className="text-xs font-medium text-[var(--text-primary)] transition-colors">
                        {t.type === TransformationType.INVERT && 'Invert Colors'}
                        {t.type === TransformationType.GRAYSCALE && 'Grayscale'}
                        {t.type === TransformationType.LAYOUT && 'Page Layout'}
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveUp(index)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Move Up">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveDown(index)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Move Down">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {t.type === TransformationType.LAYOUT && t.enabled && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-light)] space-y-5">
                      <div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 block">Density</span>
                        <div className="grid grid-cols-3 gap-2">
                          {pgsOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => updateLayout({ pagesPerSheet: opt })}
                              className={`text-[10px] py-1.5 border rounded-[6px] transition-all duration-200 
                                ${layoutConfig.pagesPerSheet === opt 
                                  ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-bg)] shadow-md' 
                                  : 'bg-[var(--bg-panel)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-sub)] active:bg-[var(--border-medium)]'}`}
                            >
                              {opt} {opt === 1 ? 'PG' : 'PGS'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 block">Orientation</span>
                          <div className="space-y-2">
                            {orientationOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateLayout({ orientation: opt.value })}
                                className={getToggleClass(layoutConfig.orientation === opt.value)}
                              >
                                {opt.icon}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 block">Ordering</span>
                          <div className="space-y-2">
                            {flowOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateLayout({ flow: opt.value })}
                                className={getToggleClass(layoutConfig.flow === opt.value)}
                              >
                                {opt.icon}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 block flex items-center gap-2">
                          <Maximize className="w-2.5 h-2.5" />
                          Spacing (mm)
                        </span>
                        
                        <div className="flex items-center border border-[var(--border-light)] bg-[var(--bg-panel)] rounded-[6px] overflow-hidden focus-within:border-[var(--text-primary)] focus-within:bg-[var(--bg-panel)] transition-all">
                          <button 
                            onClick={() => adjustSpacing(-0.5)}
                            className="p-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-sub)] hover:text-[var(--text-primary)] active:bg-[var(--border-medium)] transition-colors border-r border-[var(--border-light)]"
                            title="Decrease spacing"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <input 
                            type="number" 
                            min="1" 
                            step="0.5"
                            value={displaySpacing}
                            onChange={handleSpacingChange}
                            onBlur={handleSpacingBlur}
                            onKeyDown={handleSpacingKeyDown}
                            className="w-full bg-transparent text-[11px] font-bold text-center text-[var(--text-primary)] outline-none py-2"
                          />
                          
                          <button 
                            onClick={() => adjustSpacing(0.5)}
                            className="p-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-sub)] hover:text-[var(--text-primary)] active:bg-[var(--border-medium)] transition-colors border-l border-[var(--border-light)]"
                            title="Increase spacing"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => updateLayout({ showBorders: !layoutConfig.showBorders })}
                          className={getToggleClass(layoutConfig.showBorders)}
                          aria-pressed={layoutConfig.showBorders}
                        >
                          <span className="font-semibold uppercase tracking-widest">Page Borders</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[var(--bg-sub)] border border-[var(--border-light)] p-5 rounded-[8px]">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Summary</h3>
            <div className="space-y-2.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Files Detected</span>
                <span className="font-medium text-[var(--text-primary)]">{hasFiles ? files.length : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Merge Mode</span>
                <span className="font-medium text-[var(--text-primary)]">{layoutConfig.mergeFiles ? 'Active' : 'Individual'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Steps Active</span>
                <span className="font-medium text-[var(--text-primary)]">{pipeline.filter(p => p.enabled).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Sheet Density</span>
                <span className="font-medium text-[var(--text-primary)]">{layoutConfig.pagesPerSheet} pg/sheet</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 space-y-4">
          <Button 
            className="w-full" 
            onClick={() => {
              onProcess();
              if (onClose) onClose();
            }} 
            isLoading={isProcessing}
            disabled={!hasFiles}
          >
            {isProcessing ? 'Processing' : 'Render Document'}
          </Button>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-4 bg-[var(--border-light)]"></span>
            <p className="text-[9px] text-center text-[var(--text-muted)] uppercase tracking-[0.2em] font-medium">
              300 DPI Rendering
            </p>
            <span className="h-[1px] w-4 bg-[var(--border-light)]"></span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
