import * as pdfLib from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { TransformationType, TransformationConfig, LayoutValue, LayoutOrientation, LayoutFlow, LayoutPagesPerSheet } from '../types';

// Standard A4 dimensions in points (72 DPI)
const A4_WIDTH_PTS = 595.28;
const A4_HEIGHT_PTS = 841.89;

// Scale factor for high-resolution rendering (3x roughly equals 216 DPI)
const SCALE_FACTOR = 3;

// A4 dimensions in pixels at the specified scale factor
const A4_W_PX = A4_WIDTH_PTS * SCALE_FACTOR;
const A4_H_PX = A4_HEIGHT_PTS * SCALE_FACTOR;

// Points per millimeter constant (72 points / 25.4 mm)
const PTS_PER_MM = 72 / 25.4;

// Initialize PDF.js worker using a reliable CDN for ESM workers
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';

/**
 * Renders a PDF page to a high-quality Canvas.
 */
export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas context not found');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return canvas;
}

/**
 * Applies Invert filter to a canvas.
 */
export function applyInvert(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Applies Grayscale filter to a canvas.
 */
export function applyGrayscale(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Helper to determine grid for a given number of pages and sheet dimensions
 */
const getGrid = (n: number, isLandscape: boolean) => {
  if (n === 1) return { cols: 1, rows: 1 };
  if (n === 2) return isLandscape ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 };
  if (n === 4) return { cols: 2, rows: 2 };
  if (n === 6) return isLandscape ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };
  if (n === 8) return isLandscape ? { cols: 4, rows: 2 } : { cols: 2, rows: 4 };
  if (n === 10) return isLandscape ? { cols: 5, rows: 2 } : { cols: 2, rows: 5 };
  return { cols: 1, rows: n };
};

/**
 * Main processing engine that follows the transformation pipeline order.
 */
export async function processPdfs(
  files: File[],
  pipeline: TransformationConfig[],
  layoutConfig: LayoutValue
): Promise<Uint8Array[]> {
  const { mergeFiles } = layoutConfig;
  
  if (mergeFiles) {
    const canvases: HTMLCanvasElement[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        canvases.push(await renderPageToCanvas(pdf, i, SCALE_FACTOR));
      }
    }
    const result = await processCanvasGroup(canvases, pipeline, layoutConfig);
    return [result];
  } else {
    const results: Uint8Array[] = [];
    for (const file of files) {
      const canvases: HTMLCanvasElement[] = [];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        canvases.push(await renderPageToCanvas(pdf, i, SCALE_FACTOR));
      }
      const result = await processCanvasGroup(canvases, pipeline, layoutConfig);
      results.push(result);
    }
    return results;
  }
}

async function processCanvasGroup(
  allCanvases: HTMLCanvasElement[],
  pipeline: TransformationConfig[],
  layoutConfig: LayoutValue
): Promise<Uint8Array> {
  const mergedPdf = await pdfLib.PDFDocument.create();
  
  // Identify the position of the layout operation to partition the pipeline
  const layoutIdx = pipeline.findIndex(t => t.type === TransformationType.LAYOUT);
  const preLayoutTransforms = pipeline.slice(0, layoutIdx);
  const postLayoutTransforms = pipeline.slice(layoutIdx + 1);

  const applyTransforms = (canvas: HTMLCanvasElement, transforms: TransformationConfig[]) => {
    let currentCanvas = canvas;
    for (const t of transforms) {
      if (!t.enabled) continue;
      if (t.type === TransformationType.INVERT) {
        currentCanvas = applyInvert(currentCanvas);
      } else if (t.type === TransformationType.GRAYSCALE) {
        currentCanvas = applyGrayscale(currentCanvas);
      }
    }
    return currentCanvas;
  };

  const { pagesPerSheet, orientation, flow, showBorders, spacingMm } = layoutConfig;
  const spacingPx = spacingMm * PTS_PER_MM * SCALE_FACTOR;

  for (let i = 0; i < allCanvases.length; i += pagesPerSheet) {
    const chunk = allCanvases.slice(i, i + pagesPerSheet).map(canvas => applyTransforms(canvas, preLayoutTransforms));
    let isLandscape = false;

    if (orientation === 'LANDSCAPE') {
      isLandscape = true;
    } else if (orientation === 'SMART') {
      if (pagesPerSheet === 1) {
        isLandscape = chunk[0].width > chunk[0].height;
      } else {
        const evaluateArea = (testLandscape: boolean) => {
          const tW = testLandscape ? A4_H_PX : A4_W_PX;
          const tH = testLandscape ? A4_W_PX : A4_H_PX;
          const grid = getGrid(pagesPerSheet, testLandscape);
          const slotWidth = tW / grid.cols;
          const slotHeight = tH / grid.rows;
          const availW = slotWidth - spacingPx * 2;
          const availH = slotHeight - spacingPx * 2;
          
          let totalOccupiedArea = 0;
          chunk.forEach(canvas => {
            const canvasRatio = canvas.width / canvas.height;
            const availRatio = availW / availH;
            let dW, dH;
            if (canvasRatio > availRatio) {
              dW = availW;
              dH = availW / canvasRatio;
            } else {
              dH = availH;
              dW = availH * canvasRatio;
            }
            totalOccupiedArea += (dW * dH);
          });
          return totalOccupiedArea;
        };
        isLandscape = evaluateArea(true) > evaluateArea(false);
      }
    }

    const targetWidth = isLandscape ? A4_H_PX : A4_W_PX;
    const targetHeight = isLandscape ? A4_W_PX : A4_H_PX;

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = targetWidth;
    sheetCanvas.height = targetHeight;
    const ctx = sheetCanvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const grid = getGrid(pagesPerSheet, isLandscape);
    const slotWidth = targetWidth / grid.cols;
    const slotHeight = targetHeight / grid.rows;
    const drawnRects: { x: number; y: number; w: number; h: number }[] = [];

    chunk.forEach((canvas, idx) => {
      let cIdx, rIdx;
      if (flow === 'ROW') {
        cIdx = idx % grid.cols;
        rIdx = Math.floor(idx / grid.cols);
      } else {
        rIdx = idx % grid.rows;
        cIdx = Math.floor(idx / grid.rows);
      }

      const targetX = cIdx * slotWidth + spacingPx;
      const targetY = rIdx * slotHeight + spacingPx;
      const availableW = slotWidth - spacingPx * 2;
      const availableH = slotHeight - spacingPx * 2;
      const canvasRatio = canvas.width / canvas.height;
      const availableRatio = availableW / availableH;

      let drawW, drawH;
      if (canvasRatio > availableRatio) {
        drawW = availableW;
        drawH = availableW / canvasRatio;
      } else {
        drawH = availableH;
        drawW = availableH * canvasRatio;
      }

      const xOffset = (availableW - drawW) / 2;
      const yOffset = (availableH - drawH) / 2;
      const finalX = targetX + xOffset;
      const finalY = targetY + yOffset;
      
      ctx.drawImage(canvas, finalX, finalY, drawW, drawH);
      drawnRects.push({ x: finalX, y: finalY, w: drawW, h: drawH });
    });

    const filteredSheet = applyTransforms(sheetCanvas, postLayoutTransforms);
    if (showBorders) {
      const fCtx = filteredSheet.getContext('2d')!;
      fCtx.strokeStyle = '#18181B';
      fCtx.lineWidth = Math.max(1, Math.round(1.5 * SCALE_FACTOR));
      drawnRects.forEach(rect => fCtx.strokeRect(rect.x, rect.y, rect.w, rect.h));
    }

    const imgData = filteredSheet.toDataURL('image/jpeg', 0.95);
    const image = await mergedPdf.embedJpg(imgData);
    const pageWidth = isLandscape ? A4_HEIGHT_PTS : A4_WIDTH_PTS;
    const pageHeight = isLandscape ? A4_WIDTH_PTS : A4_HEIGHT_PTS;
    const page = mergedPdf.addPage([pageWidth, pageHeight]);
    page.drawImage(image, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }

  return await mergedPdf.save();
}
