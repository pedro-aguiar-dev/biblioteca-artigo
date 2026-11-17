// Calcula as métricas de um PR a partir da classificação revisada e do mapa cego.
//
// Uso: node ferramentas/calcular-metricas.mjs PR01
//
// Entradas: ground-truth/PRNN.json, coleta/PRNN/classificacao.json, coleta/PRNN/mapa-cego.json
// Saídas:   coleta/PRNN/resultados-PRNN.md e coleta/PRNN/resultados-PRNN.json
//
// Regras (coleta/protocolo-analise.md):
// - TP parcial conta como TP; vários achados do mesmo defeito na mesma resposta contam 1.
// - FP com o mesmo "grupo" na mesma resposta contam 1.
// - Desconsiderado não conta. Defeito não planejado pendente impede o cálculo.
// - Precision = 0 se TP+FP = 0; F1 = 0 se P+R = 0. Desvio-padrão amostral (n−1).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODELOS = {
  chatgpt: "ChatGPT (GPT-5.6 Sol)",
  claude: "Claude (Opus 5)",
  gemini: "Gemini (3.1 Pro)",
};
const CLASSES = new Set(["TP", "FP", "DESCONSIDERADO", "NAO_PLANEJADO"]);

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pr = process.argv[2];
if (!/^PR\d{2}$/.test(pr ?? "")) {
  console.error("Uso: node ferramentas/calcular-metricas.mjs PR01");
  process.exit(2);
}

const lerJson = (...partes) => JSON.parse(readFileSync(path.join(raiz, ...partes), "utf8"));
const groundTruth = lerJson("ground-truth", `${pr}.json`);
const classificacao = lerJson("coleta", pr, "classificacao.json");
const mapa = lerJson("coleta", pr, "mapa-cego.json");
const defeitos = groundTruth.defeitos.map((d) => d.bug_id);

const erros = [];
for (const id of Object.keys(mapa)) {
  if (!classificacao.respostas[id]) erros.push(`${id}: sem classificação`);
}
for (const [id, resposta] of Object.entries(classificacao.respostas)) {
  if (!mapa[id]) erros.push(`${id}: não existe no mapa cego`);
  for (const achado of resposta.achados) {
    const rotulo = `${id} achado ${achado.n}`;
    if (!CLASSES.has(achado.classificacao)) {
      erros.push(`${rotulo}: classificação inválida "${achado.classificacao}"`);
    }
    if (achado.classificacao === "TP" && !defeitos.includes(achado.defeito)) {
      erros.push(`${rotulo}: defeito "${achado.defeito}" não está no ground truth`);
    }
    if (achado.classificacao === "NAO_PLANEJADO") {
      erros.push(`${rotulo}: defeito não planejado aguardando decisão do pesquisador`);
    }
  }
}
if (erros.length > 0) {
  console.error("Não é possível calcular:\n- " + erros.join("\n- "));
  process.exit(1);
}

const execucoes = Object.entries(mapa)
  .map(([id, { modelo, execucao }]) => {
    const achados = classificacao.respostas[id].achados;
    const tps = achados.filter((a) => a.classificacao === "TP");
    const detectados = defeitos.filter((d) => tps.some((a) => a.defeito === d));
    const parciais = detectados.filter((d) =>
      tps.filter((a) => a.defeito === d).every((a) => a.parcial)
    );
    const fp = new Set(
      achados.filter((a) => a.classificacao === "FP").map((a) => a.grupo ?? `#${a.n}`)
    ).size;
    const tp = detectados.length;
    const fn = defeitos.length - tp;
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    const desconsiderados = achados.filter((a) => a.classificacao === "DESCONSIDERADO").length;
    return { id, modelo, execucao, tp, fp, fn, desconsiderados, detectados, parciais, precision, recall, f1 };
  })
  .sort((a, b) => a.modelo.localeCompare(b.modelo) || a.execucao - b.execucao);

const media = (valores) => valores.reduce((soma, v) => soma + v, 0) / valores.length;
const desvio = (valores) => {
  if (valores.length < 2) return 0;
  const m = media(valores);
  return Math.sqrt(valores.reduce((soma, v) => soma + (v - m) ** 2, 0) / (valores.length - 1));
};

const modelos = Object.keys(MODELOS).filter((m) => execucoes.some((e) => e.modelo === m));

const porModelo = modelos.map((modelo) => {
  const lista = execucoes.filter((e) => e.modelo === modelo);
  const soma = (campo) => lista.reduce((total, e) => total + e[campo], 0);
  const tp = soma("tp");
  const fp = soma("fp");
  const fn = soma("fn");
  const pMicro = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rMicro = tp / (tp + fn);
  const f1Micro = pMicro + rMicro === 0 ? 0 : (2 * pMicro * rMicro) / (pMicro + rMicro);
  const estatistica = (campo) => ({
    media: media(lista.map((e) => e[campo])),
    desvio: desvio(lista.map((e) => e[campo])),
  });
  return {
    modelo,
    execucoes: lista.length,
    precision: estatistica("precision"),
    recall: estatistica("recall"),
    f1: estatistica("f1"),
    tp,
    fp,
    fn,
    micro: { precision: pMicro, recall: rMicro, f1: f1Micro },
  };
});

const porDefeito = groundTruth.defeitos.map((d) => ({
  defeito: d.bug_id,
  titulo: d.title,
  dificuldade: d.difficulty,
  categoria: d.category,
  modelos: Object.fromEntries(
    modelos.map((modelo) => {
      const lista = execucoes.filter((e) => e.modelo === modelo);
      const sequencia = lista.map((e) => e.detectados.includes(d.bug_id));
      const deteccoes = sequencia.filter(Boolean).length;
      return [modelo, { sequencia, deteccoes, frequencia: deteccoes / lista.length }];
    })
  ),
}));

const num = (x) => x.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (x) => `${Math.round(x * 100)}%`;
const mediaDp = ({ media: m, desvio: d }) => `${num(m)} ± ${num(d)}`;

const md = [
  `# Resultados — ${groundTruth.pr} ${groundTruth.funcionalidade}`,
  "",
  `Gerado em ${new Date().toISOString()} a partir de \`classificacao.json\` (revisada) e \`mapa-cego.json\`. Regras: \`coleta/protocolo-analise.md\`.`,
  "",
  "## 1. Por execução",
  "",
  "| Modelo | Exec. | Resposta | TP | FP | FN | Desc. | Precision | Recall | F1 | Defeitos encontrados |",
  "|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|",
  ...execucoes.map(
    (e) =>
      `| ${MODELOS[e.modelo]} | ${e.execucao} | ${e.id} | ${e.tp} | ${e.fp} | ${e.fn} | ${e.desconsiderados} | ${num(e.precision)} | ${num(e.recall)} | ${num(e.f1)} | ${
        e.detectados.map((d) => (e.parciais.includes(d) ? `${d} (parcial)` : d)).join(", ") || "—"
      } |`
  ),
  "",
  "## 2. Por modelo (efetividade)",
  "",
  "Média ± desvio-padrão das execuções; à direita, os totais somados e as métricas sobre eles (micro).",
  "",
  "| Modelo | Precision | Recall | F1 | TP | FP | FN | Precision (micro) | Recall (micro) | F1 (micro) |",
  "|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|",
  ...porModelo.map(
    (m) =>
      `| ${MODELOS[m.modelo]} | ${mediaDp(m.precision)} | ${mediaDp(m.recall)} | ${mediaDp(m.f1)} | ${m.tp} | ${m.fp} | ${m.fn} | ${num(m.micro.precision)} | ${num(m.micro.recall)} | ${num(m.micro.f1)} |`
  ),
  "",
  "## 3. Frequência de detecção por defeito (estabilidade)",
  "",
  "Sequência das execuções 1→5 (✓ detectou, ✗ não detectou), detecções e frequência.",
  "",
  `| Defeito | Dificuldade | ${modelos.map((m) => MODELOS[m]).join(" | ")} |`,
  `|---|:-:|${modelos.map(() => ":-:").join("|")}|`,
  ...porDefeito.map(
    (d) =>
      `| **${d.defeito}** ${d.titulo} | ${d.dificuldade} | ${modelos
        .map((m) => {
          const r = d.modelos[m];
          return `${r.sequencia.map((v) => (v ? "✓" : "✗")).join("")} ${r.deteccoes}/${r.sequencia.length} (${pct(r.frequencia)})`;
        })
        .join(" | ")} |`
  ),
  "",
].join("\n");

const destinoMd = path.join(raiz, "coleta", pr, `resultados-${pr}.md`);
const destinoJson = path.join(raiz, "coleta", pr, `resultados-${pr}.json`);
writeFileSync(destinoMd, md);
writeFileSync(
  destinoJson,
  JSON.stringify({ pr, geradoEm: new Date().toISOString(), execucoes, porModelo, porDefeito }, null, 2) + "\n"
);
console.log(md);
