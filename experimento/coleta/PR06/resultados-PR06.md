# Resultados — PR06 Renovação de empréstimos (RF06)

Gerado em 2026-10-14T19:10:06.131Z a partir de `classificacao.json` (revisada) e `mapa-cego.json`. Regras: `coleta/protocolo-analise.md`.

## 1. Por execução

| Modelo | Exec. | Resposta | TP | FP | FN | Desc. | Precision | Recall | F1 | Defeitos encontrados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| ChatGPT (GPT-5.6 Sol) | 1 | R02 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| ChatGPT (GPT-5.6 Sol) | 2 | R06 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| ChatGPT (GPT-5.6 Sol) | 3 | R01 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| ChatGPT (GPT-5.6 Sol) | 4 | R05 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| ChatGPT (GPT-5.6 Sol) | 5 | R04 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| Claude (Opus 5) | 1 | R03 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| Claude (Opus 5) | 2 | R13 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| Claude (Opus 5) | 3 | R14 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| Claude (Opus 5) | 4 | R11 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| Claude (Opus 5) | 5 | R15 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR06-01, PR06-02, PR06-03, PR06-05 |
| Gemini (3.1 Pro) | 1 | R07 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR06-01, PR06-03, PR06-05 |
| Gemini (3.1 Pro) | 2 | R08 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR06-01, PR06-03, PR06-05 |
| Gemini (3.1 Pro) | 3 | R12 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR06-01, PR06-03, PR06-05 |
| Gemini (3.1 Pro) | 4 | R09 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR06-01, PR06-03, PR06-05 |
| Gemini (3.1 Pro) | 5 | R10 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR06-01, PR06-03, PR06-05 |

## 2. Por modelo (efetividade)

Média ± desvio-padrão das execuções; à direita, os totais somados e as métricas sobre eles (micro).

| Modelo | Precision | Recall | F1 | TP | FP | FN | Precision (micro) | Recall (micro) | F1 (micro) |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ChatGPT (GPT-5.6 Sol) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| Claude (Opus 5) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| Gemini (3.1 Pro) | 1,00 ± 0,00 | 0,75 ± 0,00 | 0,86 ± 0,00 | 15 | 0 | 5 | 1,00 | 0,75 | 0,86 |

## 3. Frequência de detecção por defeito (estabilidade)

Sequência das execuções 1→5 (✓ detectou, ✗ não detectou), detecções e frequência.

| Defeito | Dificuldade | ChatGPT (GPT-5.6 Sol) | Claude (Opus 5) | Gemini (3.1 Pro) |
|---|:-:|:-:|:-:|:-:|
| **PR06-01** Renovação calculada a partir da data atual | Média | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR06-02** Vencimento modificado antes de validar o limite | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✗✗✗✗✗ 0/5 (0%) |
| **PR06-03** Empréstimo que vence hoje é considerado atrasado | Baixa | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR06-05** Helper compartilhado altera estoque durante renovação | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
