// Gera o documento de revisão da classificação cega em Markdown (versão Word: gerar-revisao-docx.mjs).
//
// Uso: node ferramentas/gerar-revisao.mjs PR01
//
// Entradas: ground-truth/PRNN.json, coleta/PRNN/classificacao.json, coleta/PRNN/cegas/RNN.md
// Saída:    coleta/PRNN/revisao-PRNN.md
// Não lê o mapa cego (coleta/PRNN/mapa-cego.json).
//
// Formato de classificacao.json:
// {
//   "pr": "PR01",
//   "respostas": {
//     "R01": {
//       "observacao": "opcional",
//       "achados": [
//         {
//           "n": 1,
//           "trecho": "citação curta da resposta da LLM",
//           "classificacao": "TP" | "FP" | "DESCONSIDERADO" | "NAO_PLANEJADO",
//           "defeito": "PR01-01",          // só para TP
//           "parcial": false,              // só para TP: comportamento certo, causa errada/ausente
//           "grupo": "chave-do-fp",        // só para FP: FPs com o mesmo grupo na mesma resposta contam 1
//           "justificativa": "por que essa classificação"
//         }
//       ]
//     }
//   }
// }
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  raiz,
  LEGENDA,
  lerPr,
  carregarRevisao,
  resumir,
  marcarRepeticoes,
  rotuloClassificacao,
  linhaResumo,
  pontosDeAtencao,
} from "./revisao-comum.mjs";

const pr = lerPr("node ferramentas/gerar-revisao.mjs PR01");
const { groundTruth, classificacao, defeitos, ids } = carregarRevisao(pr);

const citar = (texto) =>
  texto
    .trim()
    .split(/\r?\n/)
    .map((linha) => `> ${linha}`)
    .join("\n");

const link = (id) => `[${id}](#${id.toLowerCase()})`;
const atencao = pontosDeAtencao(classificacao, ids);

const partes = [
  `# Revisão da classificação — ${groundTruth.pr} ${groundTruth.funcionalidade}`,
  "",
  `As ${ids.length} respostas aparecem só como ${ids[0]}…${ids.at(-1)}, em ordem aleatória: nem o número nem a ordem indicam o modelo. A correspondência com os modelos só é aberta depois desta revisão.`,
  "",
  "## Como revisar",
  "",
  "1. Leia o **gabarito** abaixo: são os defeitos que foram inseridos de propósito.",
  "2. Olhe a **visão geral** para ter o quadro completo.",
  "3. Comece pelos **pontos que pedem sua atenção**: são os únicos casos que envolveram julgamento.",
  "4. Em cada resposta, leia cada achado e troque `[ ]` por `[x]` em **Concordo** ou **Discordo**. Se discordar, escreva a classificação que você daria.",
  "5. Para ler uma resposta inteira, use o link **resposta completa**.",
  "",
  "## Legenda",
  "",
  "| Classificação | Significado | Conta nas métricas? |",
  "|---|---|---|",
  ...LEGENDA.map(([nome, significado, conta]) => `| **${nome}** | ${significado} | ${conta} |`),
  "",
  `## Gabarito do ${groundTruth.pr}`,
  "",
  "| Defeito | O que é, em uma frase | Onde |",
  "|---|---|---|",
  ...defeitos.map((d) => `| **${d.bug_id}** — ${d.title} | ${d.summary} | \`${d.file}\` — ${d.location} |`),
  "",
  "## Visão geral",
  "",
  `| Resposta | ${defeitos.map((d) => d.bug_id).join(" | ")} | FP | Desconsiderados |`,
  `|---|${defeitos.map(() => ":-:").join("|")}|:-:|:-:|`,
  ...ids.map((id) => {
    const r = resumir(classificacao.respostas[id].achados, defeitos);
    const celulas = defeitos.map((d) =>
      r.parciais.includes(d.bug_id) ? "✓ parcial" : r.encontrados.includes(d.bug_id) ? "✓" : "—"
    );
    return `| ${link(id)} | ${celulas.join(" | ")} | ${r.fp} | ${r.desconsiderados} |`;
  }),
  "",
  "✓ = encontrou · ✓ parcial = encontrou o comportamento, causa errada/ausente · — = não encontrou",
  "",
  "## Pontos que pedem sua atenção",
  "",
  "São os únicos casos que envolveram julgamento. O restante dos achados corresponde diretamente ao gabarito.",
  "",
  "**Classificações fora de TP (FP, desconsiderado, parcial, não planejado):**",
  "",
  ...(atencao.julgamento.length
    ? atencao.julgamento.map((j) => `- ${link(j.id)} · achado ${j.n} → **${j.rotulo}** — ${j.justificativa}`)
    : ["- Nenhuma."]),
  "",
  "**Achados consolidados (repetem a causa de outro achado da mesma resposta):**",
  "",
  ...(atencao.consolidacoes.length
    ? atencao.consolidacoes.map((c) => `- ${link(c.id)} · achado ${c.n} → mesma causa do achado ${c.repete}, conta uma vez.`)
    : ["- Nenhum."]),
  "",
  "**Trechos das respostas que não foram contados como achado:**",
  "",
  ...(atencao.observacoes.length
    ? atencao.observacoes.map((o) => `- ${link(o.id)} — ${o.texto}`)
    : ["- Nenhum."]),
  "",
];

for (const id of ids) {
  const resposta = classificacao.respostas[id];
  const arquivoResposta = `cegas/${id}.md`;
  const existeResposta = existsSync(path.join(raiz, "coleta", pr, arquivoResposta));
  const repeticoes = marcarRepeticoes(resposta.achados);

  partes.push(
    "---",
    "",
    `## ${id}`,
    "",
    `**${linhaResumo(resumir(resposta.achados, defeitos), defeitos.length)}**` +
      (existeResposta ? ` · [resposta completa](${arquivoResposta})` : ""),
    ""
  );

  if (resposta.observacao) partes.push(`*Observação:* ${resposta.observacao}`, "");
  if (resposta.achados.length === 0) partes.push("A resposta não apontou nenhum defeito.", "");

  for (const achado of resposta.achados) {
    const aviso = repeticoes.has(achado.n)
      ? ` — repete o achado ${repeticoes.get(achado.n)}, conta uma vez`
      : "";
    partes.push(
      `### ${id} · Achado ${achado.n} → ${rotuloClassificacao(achado)}${aviso}`,
      "",
      citar(achado.trecho),
      "",
      `**Por quê:** ${achado.justificativa}`,
      "",
      "- [ ] Concordo",
      "- [ ] Discordo → classificação que eu daria: ",
      ""
    );
  }
}

const destino = path.join(raiz, "coleta", pr, `revisao-${pr}.md`);
writeFileSync(destino, partes.join("\n"));
console.log(destino);
