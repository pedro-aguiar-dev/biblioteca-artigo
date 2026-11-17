// Dados e regras compartilhados pelos geradores do documento de revisão (Markdown e Word).
// Nenhuma função aqui lê o mapa cego.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const ROTULO = {
  TP: "TP",
  FP: "FP",
  DESCONSIDERADO: "Desconsiderado",
  NAO_PLANEJADO: "Defeito não planejado (pendente)",
};

export const LEGENDA = [
  ["TP", "Encontrou um defeito do gabarito.", "Sim"],
  ["TP parcial", "Apontou o comportamento errado de um defeito do gabarito, mas com causa errada ou sem causa.", "Sim, como TP (decisão A)"],
  ["FP", "Apontou um problema que não está no gabarito e não é comprovável pelos requisitos. Repetições do mesmo problema na mesma resposta contam uma vez.", "Sim"],
  ["Desconsiderado", "Comentário vago, sem localização ou comportamento identificável.", "Não (decisão B)"],
  ["Não encontrou", "Defeito do gabarito que a resposta não mencionou (FN).", "Sim"],
];

export function lerPr(uso) {
  const pr = process.argv[2];
  if (!/^PR\d{2}$/.test(pr ?? "")) {
    console.error(`Uso: ${uso}`);
    process.exit(2);
  }
  return pr;
}

export function carregarRevisao(pr) {
  const lerJson = (...partes) => JSON.parse(readFileSync(path.join(raiz, ...partes), "utf8"));
  const groundTruth = lerJson("ground-truth", `${pr}.json`);
  const classificacao = lerJson("coleta", pr, "classificacao.json");
  return {
    groundTruth,
    classificacao,
    defeitos: groundTruth.defeitos,
    ids: Object.keys(classificacao.respostas).sort(),
  };
}

export function resumir(achados, defeitos) {
  const tps = achados.filter((a) => a.classificacao === "TP");
  const encontrados = defeitos
    .map((d) => d.bug_id)
    .filter((id) => tps.some((a) => a.defeito === id));
  const parciais = encontrados.filter((id) =>
    tps.filter((a) => a.defeito === id).every((a) => a.parcial)
  );
  const fps = new Set(
    achados.filter((a) => a.classificacao === "FP").map((a) => a.grupo ?? `#${a.n}`)
  );
  const desconsiderados = achados.filter((a) => a.classificacao === "DESCONSIDERADO").length;
  const pendentes = achados.filter((a) => a.classificacao === "NAO_PLANEJADO").length;
  const naoEncontrados = defeitos.map((d) => d.bug_id).filter((id) => !encontrados.includes(id));
  return { encontrados, parciais, fp: fps.size, desconsiderados, pendentes, naoEncontrados };
}

// Mapa nº do achado → nº do achado que ele repete (mesmo defeito, ou mesmo grupo de FP).
export function marcarRepeticoes(achados) {
  const primeiraOcorrencia = new Map();
  const repeticoes = new Map();
  for (const achado of achados) {
    const chave =
      achado.classificacao === "TP"
        ? `TP:${achado.defeito}`
        : achado.classificacao === "FP"
          ? `FP:${achado.grupo ?? `#${achado.n}`}`
          : null;
    if (!chave) continue;
    if (primeiraOcorrencia.has(chave)) repeticoes.set(achado.n, primeiraOcorrencia.get(chave));
    else primeiraOcorrencia.set(chave, achado.n);
  }
  return repeticoes;
}

export function rotuloClassificacao(achado) {
  if (achado.classificacao !== "TP") return ROTULO[achado.classificacao];
  return `TP · ${achado.defeito}${achado.parcial ? " (parcial)" : ""}`;
}

export function linhaResumo(resumo, totalDefeitos) {
  return (
    `Encontrou ${resumo.encontrados.length} de ${totalDefeitos}` +
    (resumo.encontrados.length ? ` (${resumo.encontrados.join(", ")})` : "") +
    ` · FP: ${resumo.fp} · Desconsiderados: ${resumo.desconsiderados}` +
    (resumo.naoEncontrados.length ? ` · Não encontrou: ${resumo.naoEncontrados.join(", ")}` : "")
  );
}

// Casos que envolveram julgamento, consolidações e trechos não contados como achado.
export function pontosDeAtencao(classificacao, ids) {
  const julgamento = [];
  const consolidacoes = [];
  const observacoes = [];
  for (const id of ids) {
    const resposta = classificacao.respostas[id];
    const repeticoes = marcarRepeticoes(resposta.achados);
    for (const achado of resposta.achados) {
      if (["FP", "DESCONSIDERADO", "NAO_PLANEJADO"].includes(achado.classificacao) || achado.parcial) {
        julgamento.push({ id, n: achado.n, rotulo: rotuloClassificacao(achado), justificativa: achado.justificativa });
      }
      if (repeticoes.has(achado.n)) {
        consolidacoes.push({ id, n: achado.n, repete: repeticoes.get(achado.n) });
      }
    }
    if (resposta.observacao) observacoes.push({ id, texto: resposta.observacao });
  }
  return { julgamento, consolidacoes, observacoes };
}
