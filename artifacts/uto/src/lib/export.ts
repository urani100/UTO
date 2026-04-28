import { CANVAS_H, CANVAS_W } from "./types";

/** Serialize the live canvas SVG node to a clean, standalone SVG string. */
export function serializeCanvasSvg(svg: SVGSVGElement): string {
  // Clone to detach UI-only attributes.
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("viewBox", `0 0 ${CANVAS_W} ${CANVAS_H}`);
  clone.setAttribute("width", String(CANVAS_W));
  clone.setAttribute("height", String(CANVAS_H));
  // Strip data-* and class attributes that are only there for the editor's hover state.
  clone.querySelectorAll("[data-editor-only]").forEach((n) => n.remove());
  return new XMLSerializer().serializeToString(clone);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadSvg(svg: SVGSVGElement, filename = "uto.svg") {
  const xml = serializeCanvasSvg(svg);
  const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', xml], {
    type: "image/svg+xml;charset=utf-8",
  });
  downloadBlob(blob, filename);
}

export async function copySvgToClipboard(svg: SVGSVGElement) {
  const xml = serializeCanvasSvg(svg);
  await navigator.clipboard.writeText(xml);
}

export async function exportPng(svg: SVGSVGElement, scale: 1 | 2 | 4, filename = "uto.png") {
  const xml = serializeCanvasSvg(svg);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W * scale;
    canvas.height = CANVAS_H * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, filename);
        resolve();
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
