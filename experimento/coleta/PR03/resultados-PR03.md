# Resultados — PR03 Consulta ao acervo (RF03)

Gerado em 2026-10-08T16:12:02.774Z a partir de `classificacao.json` (revisada) e `mapa-cego.json`. Regras: `coleta/protocolo-analise.md`.

## 1. Por execução

| Modelo | Exec. | Resposta | TP | FP | FN | Desc. | Precision | Recall | F1 | Defeitos encontrados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| ChatGPT (GPT-5.6 Sol) | 1 | R01 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| ChatGPT (GPT-5.6 Sol) | 2 | R15 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| ChatGPT (GPT-5.6 Sol) | 3 | R14 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| ChatGPT (GPT-5.6 Sol) | 4 | R06 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| ChatGPT (GPT-5.6 Sol) | 5 | R05 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Claude (Opus 5) | 1 | R08 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Claude (Opus 5) | 2 | R07 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Claude (Opus 5) | 3 | R13 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Claude (Opus 5) | 4 | R12 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Claude (Opus 5) | 5 | R04 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Gemini (3.1 Pro) | 1 | R11 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Gemini (3.1 Pro) | 2 | R10 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Gemini (3.1 Pro) | 3 | R03 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Gemini (3.1 Pro) | 4 | R09 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |
| Gemini (3.1 Pro) | 5 | R02 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR03-01, PR03-03, PR03-04, PR03-06 |

## 2. Por modelo (efetividade)

Média ± desvio-padrão das execuções; à direita, os totais somados e as métricas sobre eles (micro).

| Modelo | Precision | Recall | F1 | TP | FP | FN | Precision (micro) | Recall (micro) | F1 (micro) |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ChatGPT (GPT-5.6 Sol) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| Claude (Opus 5) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| Gemini (3.1 Pro) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |

## 3. Frequência de detecção por defeito (estabilidade)

Sequência das execuções 1→5 (✓ detectou, ✗ não detectou), detecções e frequência.

| Defeito | Dificuldade | ChatGPT (GPT-5.6 Sol) | Claude (Opus 5) | Gemini (3.1 Pro) |
|---|:-:|:-:|:-:|:-:|
| **PR03-01** Apenas o termo pesquisado é normalizado para minúsculas | Baixa | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR03-03** Autor é pesquisado somente se nenhum título for encontrado | Média | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR03-04** Correspondência parcial implementada apenas como prefixo | Baixa | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR03-06** Resultados limitados a uma quantidade fixa (substituto do PR03-05) | Média (estimativa do assistente, aceita pelo pesquisador) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
