// Lê as decisões do pesquisador no documento de revisão em Word.
//
// Uso: node ferramentas/ler-revisao-docx.mjs PR01
//
// Entrada: coleta/PRNN/revisao-PRNN.docx (preenchido) e coleta/PRNN/classificacao.json
// Saída:   coleta/PRNN/revisao-PRNN-decisoes.json e um resumo no console.
// Considera as linhas de tabela cuja 1ª célula é "RNN-n"; a última célula é "Sua decisão".
// Célula em branco = concorda com a classificação proposta.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { raiz, lerPr, carregarRevisao } from "./revisao-comum.mjs";

const pr = lerPr("node ferramentas/ler-revisao-docx.mjs PR01");
const { classificacao } = carregarRevisao(pr);

const arquivo = path.join(raiz, "coleta", pr, `revisao-${pr}.docx`);
const zip = await JSZip.loadAsync(readFileSync(arquivo));
const xml = await zip.file("word/document.xml").async("string");

const decodificar = (texto) =>
  texto
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const textoDaCelula = (celulaXml) =>
  [...celulaXml.matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/g)]
    .map((p) => [...p[0].matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map((t) => decodificar(t[1])).join(""))
    .join("\n")
    .trim();

const linhas = [...xml.matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g)].map((linha) =>
  [...linha[0].matchAll(/<w:tc[\s>][\s\S]*?<\/w:tc>/g)].map((c) => textoDaCelula(c[0]))
);

const achadosNoDocumento = linhas
  .filter((celulas) => /^R\d{2}-\d+$/.test(celulas[0] ?? ""))
  .map((celulas) => {
    const [id, n] = celulas[0].split("-");
    return { id, n: Number(n), decisao: celulas.at(-1) };
  });

const esperados = Object.entries(classificacao.respostas).flatMap(([id, r]) =>
  r.achados.map((a) => `${id}-${a.n}`)
);
const lidos = achadosNoDocumento.map((a) => `${a.id}-${a.n}`);
const faltando = esperados.filter((chave) => !lidos.includes(chave));
if (faltando.length > 0) {
  console.error(`Linhas não encontradas no documento: ${faltando.join(", ")}`);
  process.exit(1);
}

const decisoes = achadosNoDocumento.filter((a) => a.decisao !== "");
const destino = path.join(raiz, "coleta", pr, `revisao-${pr}-decisoes.json`);
writeFileSync(destino, JSON.stringify({ pr, lidoEm: new Date().toISOString(), decisoes }, null, 2) + "\n");

console.log(`${achadosNoDocumento.length} achados lidos; ${decisoes.length} com decisão do pesquisador.`);
for (const d of decisoes) console.log(`- ${d.id} achado ${d.n}: ${d.decisao}`);
