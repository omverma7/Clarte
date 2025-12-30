
export enum TransformationType {
  INVERT = 'INVERT',
  GRAYSCALE = 'GRAYSCALE',
  LAYOUT = 'LAYOUT',
}

export type LayoutPagesPerSheet = 1 | 2 | 4 | 6 | 8 | 10;
export type LayoutOrientation = 'PORTRAIT' | 'LANDSCAPE' | 'SMART';
export type LayoutFlow = 'ROW' | 'COLUMN';

export interface LayoutValue {
  pagesPerSheet: LayoutPagesPerSheet;
  orientation: LayoutOrientation;
  flow: LayoutFlow;
  showBorders: boolean;
  spacingMm: number;
  mergeFiles: boolean;
}

export interface TransformationConfig {
  id: string;
  type: TransformationType;
  enabled: boolean;
  value?: any;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export interface FileData {
  id: string;
  name: string;
  size: number;
  file: File;
}
