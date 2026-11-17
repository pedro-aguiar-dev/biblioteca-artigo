// Gera o documento de revisão da classificação cega em Word (.docx), para o pesquisador
// preencher e devolver. Mesmo conteúdo do gerar-revisao.mjs (Markdown).
//
// Uso: node ferramentas/gerar-revisao-docx.mjs PR01
//
// Entradas: ground-truth/PRNN.json, coleta/PRNN/classificacao.json
// Saída:    coleta/PRNN/revisao-PRNN.docx
// Cada achado é uma linha de tabela cuja 1ª célula é "RNN-n" e a última, "Sua decisão",
// vem em branco; ferramentas/ler-revisao-docx.mjs lê de volta o que o pesquisador escrever.
// Não lê o mapa cego.
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  PageOrientation,
  ShadingType,
} from "docx";
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

const COR_CABECALHO = "D9E2F3";
const COR_DECISAO = "FFF2CC";

const pr = lerPr("node ferramentas/gerar-revisao-docx.mjs PR01");
const { groundTruth, classificacao, defeitos, ids } = carregarRevisao(pr);
const atencao = pontosDeAtencao(classificacao, ids);

const paragrafo = (texto, estilo = {}) =>
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: texto, ...estilo })] });

const titulo = (texto, nivel) => new Paragraph({ text: texto, heading: nivel, spacing: { before: 240, after: 120 } });

const item = (texto) => new Paragraph({ text: texto, bullet: { level: 0 } });

const passo = (numero, texto) =>
  new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text: `${numero}. `, bold: true }), new TextRun(texto)],
  });

function celula(conteudo, { largura, cabecalho = false, fundo } = {}) {
  const cor = cabecalho ? COR_CABECALHO : fundo;
  return new TableCell({
    width: { size: largura, type: WidthType.PERCENTAGE },
    shading: cor ? { type: ShadingType.CLEAR, color: "auto", fill: cor } : undefined,
    children: String(conteudo)
      .split("\n")
      .map((linha) => new Paragraph({ children: [new TextRun({ text: linha, bold: cabecalho })] })),
  });
}

function tabela(cabecalhos, linhas, larguras, { ultimaColunaParaPreencher = false } = {}) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: cabecalhos.map((c, i) => celula(c, { largura: larguras[i], cabecalho: true })),
      }),
      ...linhas.map(
        (linha) =>
          new TableRow({
            children: linha.map((c, i) =>
              celula(c, {
                largura: larguras[i],
                fundo: ultimaColunaParaPreencher && i === linha.length - 1 ? COR_DECISAO : undefined,
              })
            ),
          })
      ),
    ],
  });
}

const conteudo = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    children: [new TextRun(`Revisão da classificação — ${groundTruth.pr} ${groundTruth.funcionalidade}`)],
  }),
  paragrafo(
    `As ${ids.length} respostas aparecem só como ${ids[0]}…${ids.at(-1)}, em ordem aleatória: nem o número nem a ordem indicam o modelo. A correspondência com os modelos só é aberta depois desta revisão.`
  ),

  titulo("Como preencher", HeadingLevel.HEADING_1),
  passo(1, "Leia o gabarito e os pontos que pedem sua atenção (logo abaixo). Eles são os únicos casos que envolveram julgamento."),
  passo(2, "Em cada resposta há uma tabela com os achados. A última coluna, “Sua decisão” (em amarelo), está em branco."),
  passo(3, "Se você concorda com a classificação proposta, deixe a célula em branco."),
  passo(4, `Se discorda, escreva nela a classificação correta — por exemplo: FP, Desconsiderado ou TP ${defeitos.at(-1).bug_id} — e, se quiser, o motivo.`),
  passo(5, `Salve o arquivo com o mesmo nome (revisao-${pr}.docx), na mesma pasta, e avise o assistente.`),

  titulo("Legenda", HeadingLevel.HEADING_1),
  tabela(["Classificação", "Significado", "Conta nas métricas?"], LEGENDA, [18, 62, 20]),

  titulo(`Gabarito do ${groundTruth.pr}`, HeadingLevel.HEADING_1),
  tabela(
    ["Defeito", "O que é, em uma frase", "Onde"],
    defeitos.map((d) => [`${d.bug_id} — ${d.title}`, d.summary, `${d.file}\n${d.location}`]),
    [28, 37, 35]
  ),

  titulo("Visão geral", HeadingLevel.HEADING_1),
  tabela(
    ["Resposta", ...defeitos.map((d) => d.bug_id), "FP", "Desconsiderados"],
    ids.map((id) => {
      const r = resumir(classificacao.respostas[id].achados, defeitos);
      return [
        id,
        ...defeitos.map((d) =>
          r.parciais.includes(d.bug_id) ? "✓ parcial" : r.encontrados.includes(d.bug_id) ? "✓" : "—"
        ),
        String(r.fp),
        String(r.desconsiderados),
      ];
    }),
    [16, ...defeitos.map(() => 60 / defeitos.length), 10, 14]
  ),
  paragrafo("✓ = encontrou · ✓ parcial = encontrou o comportamento, causa errada/ausente · — = não encontrou", {
    italics: true,
    size: 18,
  }),

  titulo("Pontos que pedem sua atenção", HeadingLevel.HEADING_1),
  paragrafo("São os únicos casos que envolveram julgamento. O restante dos achados corresponde diretamente ao gabarito."),
  paragrafo("Classificações fora de TP (FP, desconsiderado, parcial, não planejado):", { bold: true }),
  ...(atencao.julgamento.length
    ? atencao.julgamento.map((j) => item(`${j.id} · achado ${j.n} → ${j.rotulo} — ${j.justificativa}`))
    : [item("Nenhuma.")]),
  paragrafo("Achados consolidados (repetem a causa de outro achado da mesma resposta):", { bold: true }),
  ...(atencao.consolidacoes.length
    ? atencao.consolidacoes.map((c) => item(`${c.id} · achado ${c.n} → mesma causa do achado ${c.repete}, conta uma vez.`))
    : [item("Nenhum.")]),
  paragrafo("Trechos das respostas que não foram contados como achado:", { bold: true }),
  ...(atencao.observacoes.length
    ? atencao.observacoes.map((o) => item(`${o.id} — ${o.texto}`))
    : [item("Nenhum.")]),

  titulo("Achados de cada resposta", HeadingLevel.HEADING_1),
  paragrafo(`A resposta completa de cada uma está em coleta/${pr}/cegas/RNN.md.`, { italics: true }),
];

for (const id of ids) {
  const resposta = classificacao.respostas[id];
  const repeticoes = marcarRepeticoes(resposta.achados);

  conteudo.push(
    titulo(id, HeadingLevel.HEADING_2),
    paragrafo(linhaResumo(resumir(resposta.achados, defeitos), defeitos.length), { bold: true })
  );
  if (resposta.observacao) conteudo.push(paragrafo(`Observação: ${resposta.observacao}`, { italics: true }));

  if (resposta.achados.length === 0) {
    conteudo.push(paragrafo("A resposta não apontou nenhum defeito."));
    continue;
  }

  conteudo.push(
    tabela(
      ["Achado", "O que a resposta diz", "Classificação proposta", "Por quê", "Sua decisão"],
      resposta.achados.map((achado) => [
        `${id}-${achado.n}`,
        achado.trecho,
        rotuloClassificacao(achado) +
          (repeticoes.has(achado.n) ? `\n(repete o achado ${repeticoes.get(achado.n)} — conta uma vez)` : ""),
        achado.justificativa,
        "",
      ]),
      [8, 37, 13, 27, 15],
      { ultimaColunaParaPreencher: true }
    )
  );
}

const documento = new Document({
  creator: "Assistente de desenvolvimento do experimento",
  title: `Revisão da classificação — ${groundTruth.pr}`,
  styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
  sections: [
    {
      properties: {
        page: {
          size: { orientation: PageOrientation.LANDSCAPE },
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children: conteudo,
    },
  ],
});

const destino = path.join(raiz, "coleta", pr, `revisao-${pr}.docx`);
writeFileSync(destino, await Packer.toBuffer(documento));
console.log(destino);
