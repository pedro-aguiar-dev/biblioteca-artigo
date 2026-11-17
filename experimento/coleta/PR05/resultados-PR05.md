# Resultados — PR05 Realização de devoluções (RF05)

Gerado em 2026-10-09T21:08:19.795Z a partir de `classificacao.json` (revisada) e `mapa-cego.json`. Regras: `coleta/protocolo-analise.md`.

## 1. Por execução

| Modelo | Exec. | Resposta | TP | FP | FN | Desc. | Precision | Recall | F1 | Defeitos encontrados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| ChatGPT (GPT-5.6 Sol) | 1 | R03 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| ChatGPT (GPT-5.6 Sol) | 2 | R08 | 4 | 1 | 0 | 0 | 0,80 | 1,00 | 0,89 | PR05-01, PR05-02, PR05-03, PR05-05 |
| ChatGPT (GPT-5.6 Sol) | 3 | R07 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| ChatGPT (GPT-5.6 Sol) | 4 | R14 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| ChatGPT (GPT-5.6 Sol) | 5 | R13 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| Claude (Opus 5) | 1 | R09 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| Claude (Opus 5) | 2 | R01 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| Claude (Opus 5) | 3 | R06 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| Claude (Opus 5) | 4 | R02 | 4 | 1 | 0 | 0 | 0,80 | 1,00 | 0,89 | PR05-01, PR05-02, PR05-03, PR05-05 |
| Claude (Opus 5) | 5 | R05 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR05-01, PR05-02, PR05-03, PR05-05 |
| Gemini (3.1 Pro) | 1 | R04 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR05-01, PR05-02, PR05-03 |
| Gemini (3.1 Pro) | 2 | R12 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR05-01, PR05-02, PR05-03 |
| Gemini (3.1 Pro) | 3 | R10 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR05-01, PR05-02, PR05-03 |
| Gemini (3.1 Pro) | 4 | R15 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR05-01, PR05-02, PR05-03 |
| Gemini (3.1 Pro) | 5 | R11 | 3 | 0 | 1 | 0 | 1,00 | 0,75 | 0,86 | PR05-01, PR05-02, PR05-03 |

## 2. Por modelo (efetividade)

Média ± desvio-padrão das execuções; à direita, os totais somados e as métricas sobre eles (micro).

| Modelo | Precision | Recall | F1 | TP | FP | FN | Precision (micro) | Recall (micro) | F1 (micro) |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ChatGPT (GPT-5.6 Sol) | 0,96 ± 0,09 | 1,00 ± 0,00 | 0,98 ± 0,05 | 20 | 1 | 0 | 0,95 | 1,00 | 0,98 |
| Claude (Opus 5) | 0,96 ± 0,09 | 1,00 ± 0,00 | 0,98 ± 0,05 | 20 | 1 | 0 | 0,95 | 1,00 | 0,98 |
| Gemini (3.1 Pro) | 1,00 ± 0,00 | 0,75 ± 0,00 | 0,86 ± 0,00 | 15 | 0 | 5 | 1,00 | 0,75 | 0,86 |

## 3. Frequência de detecção por defeito (estabilidade)

Sequência das execuções 1→5 (✓ detectou, ✗ não detectou), detecções e frequência.

| Defeito | Dificuldade | ChatGPT (GPT-5.6 Sol) | Claude (Opus 5) | Gemini (3.1 Pro) |
|---|:-:|:-:|:-:|:-:|
| **PR05-01** Estoque incrementado antes de verificar devolução duplicada | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR05-02** Empréstimo atrasado não pode ser devolvido | Média | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR05-03** Devolução restaura todo o estoque do livro | Média | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR05-05** Atualização do empréstimo e do estoque sem atomicidade | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✗✗✗✗✗ 0/5 (0%) |
