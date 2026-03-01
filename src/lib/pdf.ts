"use client";

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Collect text items with their positions
    type LineItem = { x: number; y: number; str: string; height: number };
    const items: LineItem[] = [];

    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      items.push({
        x: item.transform[4],
        y: item.transform[5],
        str: item.str,
        height: item.height || 10,
      });
    }

    if (items.length === 0) continue;

    // Sort top-to-bottom (PDF Y axis is bottom-up, so higher Y = higher on page)
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    // Group items into lines by Y proximity (within half a line-height)
    const lines: LineItem[][] = [];
    let currentLine: LineItem[] = [items[0]];

    for (let j = 1; j < items.length; j++) {
      const prev = items[j - 1];
      const curr = items[j];
      const threshold = Math.max(prev.height, curr.height) * 0.5;

      if (Math.abs(curr.y - prev.y) <= threshold) {
        currentLine.push(curr);
      } else {
        lines.push(currentLine);
        currentLine = [curr];
      }
    }
    lines.push(currentLine);

    // Build page text — detect paragraph gaps between lines
    const lineStrings: string[] = [];
    for (let j = 0; j < lines.length; j++) {
      // Sort each line left-to-right
      const sorted = lines[j].slice().sort((a, b) => a.x - b.x);
      const lineText = sorted.map((it) => it.str).join(" ").replace(/\s+/g, " ").trim();

      if (!lineText) continue;

      // Insert blank line if gap to next line is large (paragraph break)
      if (j > 0) {
        const prevY = lines[j - 1][0].y;
        const currY = lines[j][0].y;
        const gap = prevY - currY;
        const avgHeight = (lines[j - 1][0].height + lines[j][0].height) / 2;
        if (gap > avgHeight * 1.8) {
          lineStrings.push("");
        }
      }

      lineStrings.push(lineText);
    }

    pageTexts.push(lineStrings.join("\n"));
  }

  return pageTexts.join("\n\n").trim();
}
