// Monta o texto entregue às LLMs, na ordem do GUIA §18.1:
// prompt fixo → requisitos → descrição do PR → diff.
//
// Uso: node ferramentas/montar-entrada.mjs PR01
// Lê submissoes/prompt-fixo.txt e submissoes/PRNN/{requisitos.txt, descricao.txt, diff.patch}
// e grava submissoes/PRNN/entrada-llm.txt (UTF-8, sem BOM, quebras de linha LF).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pr = process.argv[2];
if (!/^PR\d{2}$/.test(pr ?? "")) {
  console.error("Uso: node ferramentas/montar-entrada.mjs PR01");
  process.exit(2);
}

const ler = (...partes) =>
  readFileSync(path.join(raiz, "submissoes", ...partes), "utf8").replace(/\r\n/g, "\n").trimEnd();

const entrada = [
  ler("prompt-fixo.txt"),
  "",
  "Requisitos da funcionalidade:",
  ler(pr, "requisitos.txt"),
  "",
  "Descrição do Pull Request:",
  ler(pr, "descricao.txt"),
  "",
  "Diff:",
  ler(pr, "diff.patch"),
  "",
].join("\n");

const destino = path.join(raiz, "submissoes", pr, "entrada-llm.txt");
writeFileSync(destino, entrada);

const hash = createHash("sha256").update(entrada).digest("hex");
console.log(`${destino}\n${entrada.split("\n").length} linhas · SHA-256 ${hash}`);
