// Matriz de independência dos defeitos de um PR.
//
// Uso: node ferramentas/matriz-oraculos.mjs PR01
//
// Variantes avaliadas:
//   - baseline       → arquivos da tag prNN-baseline
//   - cada mutante   → baseline + arquivos de mutantes/PRNN/<ID>/ (um único defeito)
//   - experimental   → arquivos da tag prNN-experimental (todos os defeitos juntos)
// Para cada variante, grava os arquivos no working tree do repositório, executa cada
// teste-oráculo em processo separado e registra passa/falha. No fim restaura os arquivos.
// Critério esperado: baseline passa em tudo; o mutante X falha só no oráculo X;
// o experimental falha em todos os oráculos.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(raiz, "..");
const pr = process.argv[2];
if (!/^PR\d{2}$/.test(pr ?? "")) {
  console.error("Uso: node ferramentas/matriz-oraculos.mjs PR01");
  process.exit(2);
}
const prefixoTag = pr.toLowerCase();

const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" });

function listarArquivos(pasta, base = pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const completo = path.join(pasta, entrada.name);
    return entrada.isDirectory()
      ? listarArquivos(completo, base)
      : [path.relative(base, completo).split(path.sep).join("/")];
  });
}

const pastaMutantes = path.join(raiz, "mutantes", pr);
const mutantes = readdirSync(pastaMutantes, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
const arquivosPorMutante = Object.fromEntries(
  mutantes.map((id) => [id, listarArquivos(path.join(pastaMutantes, id))])
);
const arquivos = [...new Set(Object.values(arquivosPorMutante).flat())].sort();

const pastaOraculos = path.join(raiz, "testes", "oraculos", pr);
const oraculos = readdirSync(pastaOraculos)
  .filter((nome) => nome.endsWith(".test.js"))
  .map((nome) => nome.replace(/\.test\.js$/, ""))
  .sort();

const versaoDaTag = (tag) =>
  Object.fromEntries(
    arquivos.map((arquivo) => [arquivo, git("show", `refs/tags/${tag}:${arquivo}`)])
  );

const baseline = versaoDaTag(`${prefixoTag}-baseline`);
const variantes = [
  { nome: "baseline", esperadoFalhar: [], conteudo: baseline },
  ...mutantes.map((id) => ({
    nome: `só ${id}`,
    esperadoFalhar: [id],
    conteudo: {
      ...baseline,
      ...Object.fromEntries(
        arquivosPorMutante[id].map((arquivo) => [
          arquivo,
          readFileSync(path.join(pastaMutantes, id, arquivo), "utf8"),
        ])
      ),
    },
  })),
  {
    nome: "experimental (todos)",
    esperadoFalhar: oraculos,
    conteudo: versaoDaTag(`${prefixoTag}-experimental`),
  },
];

const originais = Object.fromEntries(
  arquivos.map((arquivo) => [arquivo, readFileSync(path.join(repo, arquivo))])
);

const linhas = [];
let conforme = true;

try {
  for (const variante of variantes) {
    for (const [arquivo, conteudo] of Object.entries(variante.conteudo)) {
      writeFileSync(path.join(repo, arquivo), conteudo);
    }

    const resultados = oraculos.map((oraculo) => {
      const execucao = spawnSync(
        process.execPath,
        ["--test", path.join(pastaOraculos, `${oraculo}.test.js`)],
        { cwd: raiz, encoding: "utf8" }
      );
      const falhou = execucao.status !== 0;
      const esperado = variante.esperadoFalhar.includes(oraculo);
      if (falhou !== esperado) conforme = false;
      return { falhou, esperado };
    });

    linhas.push({ nome: variante.nome, resultados });
  }
} finally {
  for (const [arquivo, conteudo] of Object.entries(originais)) {
    writeFileSync(path.join(repo, arquivo), conteudo);
  }
}

const celula = ({ falhou, esperado }) =>
  `${falhou ? "FALHA" : "passa"}${falhou === esperado ? "" : " ⚠ inesperado"}`;

const tabela = [
  `| Variante | ${oraculos.map((o) => `Oráculo ${o}`).join(" | ")} |`,
  `|---|${oraculos.map(() => "---").join("|")}|`,
  ...linhas.map((l) => `| ${l.nome} | ${l.resultados.map(celula).join(" | ")} |`),
].join("\n");

const relatorio = [
  `# Matriz de independência — ${pr}`,
  "",
  `Gerado em ${new Date().toISOString()} · arquivos variados: ${arquivos.join(", ")}`,
  "",
  tabela,
  "",
  conforme
    ? "Resultado: **conforme** — cada oráculo falha somente com o seu defeito; a baseline passa em todos; a versão experimental falha em todos."
    : "Resultado: **NÃO conforme** — há interferência ou oráculo inadequado (ver células marcadas com ⚠).",
  "",
].join("\n");

mkdirSync(path.join(raiz, "resultados"), { recursive: true });
writeFileSync(path.join(raiz, "resultados", `${pr}-matriz-oraculos.md`), relatorio);
console.log(relatorio);
process.exit(conforme ? 0 : 1);
