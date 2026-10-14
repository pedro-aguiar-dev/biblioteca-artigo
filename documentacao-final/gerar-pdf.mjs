import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const docs = [
  "RELATORIO-COMPLETO-EXPERIMENTO",
  "ESPECIFICACAO-ATUALIZADA",
  "GUIA-EXPERIMENTAL-ATUALIZADO",
];

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function markdownToHtml(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const n = h[1].length; html.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (/^\|.*\|\s*$/.test(line) && /^\|?\s*[-:]+/.test(lines[i + 1]?.split("|")[1] ?? "")) {
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
      const data = rows.filter((_, n) => n !== 1).map((r) => r.slice(1, -1).split("|").map((c) => c.trim()));
      html.push("<table><thead><tr>" + data[0].map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>" + data.slice(1).map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") + "</tbody></table>");
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ""));
      html.push("<ul>" + items.map((x) => `<li>${inline(x)}</li>`).join("") + "</ul>"); continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ""));
      html.push("<ol>" + items.map((x) => `<li>${inline(x)}</li>`).join("") + "</ol>"); continue;
    }
    if (line.startsWith("> ")) { html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); i++; continue; }
    let p = line.trim();
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#{1,4})\s|^[-*]\s+|^\d+\.\s+|^\|.*\|\s*$|^> /.test(lines[i + 1])) p += " " + lines[++i].trim();
    html.push(`<p>${inline(p)}</p>`); i++;
  }
  return html.join("\n");
}

const css = `
@page { size: A4; margin: 18mm 15mm 18mm 18mm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #1f2933; font-size: 10pt; line-height: 1.45; margin: 0; }
h1 { color: #17365d; font-size: 23pt; text-align: center; margin: 20mm 0 9mm; page-break-before: always; }
h1:first-child { page-break-before: avoid; }
h2 { color: #17365d; font-size: 16pt; margin: 8mm 0 3mm; page-break-after: avoid; border-bottom: 1px solid #b8cce4; padding-bottom: 1.5mm; }
h3 { color: #1f4e79; font-size: 13pt; margin: 6mm 0 2mm; page-break-after: avoid; }
h4 { color: #365f91; font-size: 11pt; margin: 5mm 0 2mm; page-break-after: avoid; }
p { text-align: justify; margin: 0 0 3mm; orphans: 3; widows: 3; }
ul, ol { margin: 1mm 0 4mm 7mm; padding-left: 5mm; }
li { margin: 0 0 1.2mm; }
code { font-family: Consolas, monospace; background: #eef1f4; padding: 0.2mm 0.8mm; border-radius: 1mm; font-size: 9pt; }
blockquote { margin: 3mm 5mm; padding: 3mm 4mm; border-left: 3px solid #4f81bd; background: #f3f6f9; }
table { border-collapse: collapse; width: 100%; margin: 3mm 0 5mm; font-size: 8pt; page-break-inside: auto; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th { background: #d9eaf7; color: #17365d; font-weight: 700; }
th, td { border: 0.35mm solid #aeb6bf; padding: 1.4mm; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
strong { color: #172b4d; }
`;

for (const base of docs) {
  const md = fs.readFileSync(path.join(dir, `${base}.md`), "utf8");
  const title = md.match(/^#\s+(.+)$/m)?.[1] ?? base;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${markdownToHtml(md)}</body></html>`;
  fs.writeFileSync(path.join(dir, `${base}.html`), html, "utf8");
  console.log(`HTML preparado: ${base}.html`);
}
