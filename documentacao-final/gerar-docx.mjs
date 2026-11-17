import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "experimento", "package.json"));
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, Header, Footer, PageNumber, TableOfContents,
  PageBreak, ShadingType, VerticalAlign
} = require("docx");

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const docs = [
  ["RELATORIO-COMPLETO-EXPERIMENTO.md", "RELATORIO-COMPLETO-EXPERIMENTO.docx"],
  ["ESPECIFICACAO-ATUALIZADA.md", "ESPECIFICACAO-ATUALIZADA.docx"],
  ["GUIA-EXPERIMENTAL-ATUALIZADO.md", "GUIA-EXPERIMENTAL-ATUALIZADO.docx"],
];

function runs(text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) => {
    if (p.startsWith("**")) return new TextRun({ text: p.slice(2, -2), bold: true });
    if (p.startsWith("`")) return new TextRun({ text: p.slice(1, -1), font: "Consolas", size: 19, shading: { fill: "EEEEEE" } });
    return new TextRun({ text: p });
  });
}

function parseTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
  const parsed = rows.filter((_, n) => n !== 1).map((row) => row.slice(1, -1).split("|").map((x) => x.trim()));
  const columnCount = Math.max(...parsed.map((r) => r.length));
  const width = Math.floor(100 / columnCount);
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: parsed.map((cells, ri) => new TableRow({
      tableHeader: ri === 0,
      children: Array.from({ length: columnCount }, (_, ci) => new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        shading: ri === 0 ? { type: ShadingType.CLEAR, fill: "D9EAF7" } : undefined,
        children: [new Paragraph({ children: ri === 0 ? [new TextRun({ text: cells[ci] ?? "", bold: true })] : runs(cells[ci] ?? ""), spacing: { before: 40, after: 40 } })],
      }))
    })),
    borders: { top:{style:BorderStyle.SINGLE,size:2,color:"AAAAAA"}, bottom:{style:BorderStyle.SINGLE,size:2,color:"AAAAAA"}, left:{style:BorderStyle.SINGLE,size:2,color:"AAAAAA"}, right:{style:BorderStyle.SINGLE,size:2,color:"AAAAAA"}, insideHorizontal:{style:BorderStyle.SINGLE,size:1,color:"CCCCCC"}, insideVertical:{style:BorderStyle.SINGLE,size:1,color:"CCCCCC"} }
  });
  return { table, next: i };
}

function markdownToChildren(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const children = [];
  let inQuote = false;
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (/^\|.*\|\s*$/.test(line) && /^\|?\s*[-:]+/.test(lines[i + 1]?.split("|")[1] ?? "")) {
      const { table, next } = parseTable(lines, i); children.push(table); i = next; continue;
    }
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const levels = [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3];
      children.push(new Paragraph({ heading: levels[h[1].length - 1], children: runs(h[2]), pageBreakBefore: h[1].length === 2 && children.length > 3, keepNext: true }));
      if (h[1].length === 1) children.push(new Paragraph({ children: [new TextRun({ text: "Documento consolidado do projeto", italics: true, color: "555555", size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
      i++; continue;
    }
    const list = line.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (list) {
      children.push(new Paragraph({ children: runs(list[2]), bullet: list[1] === "-" || list[1] === "*" ? { level: 0 } : undefined, numbering: /^\d/.test(list[1]) ? { reference: "numbered", level: 0 } : undefined, spacing: { after: 80 } }));
      i++; continue;
    }
    if (line.startsWith("> ")) {
      children.push(new Paragraph({ children: runs(line.slice(2)), indent: { left: 600, right: 300 }, border: { left: { style: BorderStyle.SINGLE, size: 8, color: "4F81BD" } }, shading: { fill: "F3F6F9" }, spacing: { before: 80, after: 80 } }));
      i++; continue;
    }
    let para = line.trim();
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#{1,4})\s|^([-*]|\d+\.)\s|^\|.*\|\s*$|^> /.test(lines[i + 1])) para += " " + lines[++i].trim();
    children.push(new Paragraph({ children: runs(para), alignment: AlignmentType.JUSTIFIED, spacing: { after: 140, line: 300 } }));
    i++;
  }
  return children;
}

for (const [mdName, docxName] of docs) {
  const md = fs.readFileSync(path.join(dir, mdName), "utf8");
  const children = markdownToChildren(md);
  const doc = new Document({
    creator: "Projeto Biblioteca — documentação experimental",
    title: md.split("\n")[0].replace(/^# /, ""),
    description: "Documentação consolidada do experimento de avaliação de LLMs em Pull Requests",
    numbering: { config: [{ reference: "numbered", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 500, hanging: 260 } } } }] }] },
    styles: {
      default: { document: { run: { font: "Aptos", size: 22 }, paragraph: { spacing: { after: 120 } } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 38, bold: true, color: "17365D" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 600, after: 300 } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, color: "17365D" }, paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: "1F4E79" }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 23, bold: true, color: "365F91" }, paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: { page: { margin: { top: 1000, right: 850, bottom: 900, left: 1000 } } },
      headers: { default: new Header({ children: [new Paragraph({ text: "Sistema de Biblioteca — documentação consolidada", alignment: AlignmentType.RIGHT })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Página "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" de "), new TextRun({ children: [PageNumber.TOTAL_PAGES] })] })] }) },
      children
    }]
  });
  fs.writeFileSync(path.join(dir, docxName), await Packer.toBuffer(doc));
  console.log(`Gerado: ${docxName}`);
}
