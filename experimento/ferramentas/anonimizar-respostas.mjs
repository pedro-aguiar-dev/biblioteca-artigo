// Anonimiza as respostas de um PR para classificação cega.
//
// Uso: node ferramentas/anonimizar-respostas.mjs PR01
//
// Lê coleta/PRNN/{gpt|chatgpt,claude,gemini}/execucao-{1..5}.md, embaralha (crypto) e grava
// coleta/PRNN/cegas/R01.md … R15.md. O mapa R → modelo/execução vai para
// coleta/PRNN/mapa-cego.json, que NÃO deve ser aberto antes do fim da classificação.
// Recusa-se a rodar de novo se o mapa já existir (evita reembaralhar).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { randomInt } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Modelo → nomes de pasta aceitos (o pesquisador usa "gpt"; o PR01 ficou como "chatgpt").
const PASTAS_POR_MODELO = { chatgpt: ["gpt", "chatgpt"], claude: ["claude"], gemini: ["gemini"] };
const EXECUCOES = 5;
const NOMES_DE_MODELOS = /chat\s?gpt|\bgpt\b|openai|claude|anthropic|gemini|google|bard/i;

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pr = process.argv[2];
if (!/^PR\d{2}$/.test(pr ?? "")) {
  console.error("Uso: node ferramentas/anonimizar-respostas.mjs PR01");
  process.exit(2);
}

const pasta = path.join(raiz, "coleta", pr);
const arquivoMapa = path.join(pasta, "mapa-cego.json");
if (existsSync(arquivoMapa)) {
  console.error(`${arquivoMapa} já existe. Não reembaralhar: apague-o manualmente só se for refazer a anonimização.`);
  process.exit(1);
}

const respostas = [];
const problemas = [];
for (const [modelo, nomesAceitos] of Object.entries(PASTAS_POR_MODELO)) {
  const nomePasta = nomesAceitos.find((nome) => existsSync(path.join(pasta, nome)));
  if (!nomePasta) {
    problemas.push(`faltando a pasta de ${modelo} (${nomesAceitos.join(" ou ")})`);
    continue;
  }
  for (let execucao = 1; execucao <= EXECUCOES; execucao++) {
    const relativo = `${nomePasta}/execucao-${execucao}.md`;
    const arquivo = path.join(pasta, nomePasta, `execucao-${execucao}.md`);
    if (!existsSync(arquivo)) {
      problemas.push(`faltando: ${relativo}`);
      continue;
    }
    const texto = readFileSync(arquivo, "utf8").replace(/^﻿/, "");
    if (texto.trim() === "") problemas.push(`vazio: ${relativo}`);
    if (NOMES_DE_MODELOS.test(texto)) {
      problemas.push(`menciona nome de modelo/empresa (remover se for cabeçalho colado por engano): ${relativo}`);
    }
    respostas.push({ modelo, execucao, texto });
  }
}

if (problemas.length > 0) {
  console.error("Corrija antes de anonimizar:\n- " + problemas.join("\n- "));
  process.exit(1);
}

for (let i = respostas.length - 1; i > 0; i--) {
  const j = randomInt(i + 1);
  [respostas[i], respostas[j]] = [respostas[j], respostas[i]];
}

mkdirSync(path.join(pasta, "cegas"), { recursive: true });
const mapa = {};
respostas.forEach((resposta, indice) => {
  const id = `R${String(indice + 1).padStart(2, "0")}`;
  writeFileSync(path.join(pasta, "cegas", `${id}.md`), resposta.texto);
  mapa[id] = { modelo: resposta.modelo, execucao: resposta.execucao };
});
writeFileSync(arquivoMapa, JSON.stringify(mapa, null, 2) + "\n");

console.log(`${respostas.length} respostas anonimizadas em coleta/${pr}/cegas/ (R01…R${String(respostas.length).padStart(2, "0")}).`);
console.log(`Mapa gravado em coleta/${pr}/mapa-cego.json — não abrir antes de concluir a classificação.`);
