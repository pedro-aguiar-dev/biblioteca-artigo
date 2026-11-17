# Resultados — PR04 Realização de empréstimos (RF04)

Gerado em 2026-10-09T20:23:30.350Z a partir de `classificacao.json` (revisada) e `mapa-cego.json`. Regras: `coleta/protocolo-analise.md`.

## 1. Por execução

| Modelo | Exec. | Resposta | TP | FP | FN | Desc. | Precision | Recall | F1 | Defeitos encontrados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| ChatGPT (GPT-5.6 Sol) | 1 | R06 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| ChatGPT (GPT-5.6 Sol) | 2 | R13 | 5 | 1 | 0 | 0 | 0,83 | 1,00 | 0,91 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| ChatGPT (GPT-5.6 Sol) | 3 | R10 | 5 | 1 | 0 | 0 | 0,83 | 1,00 | 0,91 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| ChatGPT (GPT-5.6 Sol) | 4 | R01 | 5 | 1 | 0 | 0 | 0,83 | 1,00 | 0,91 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| ChatGPT (GPT-5.6 Sol) | 5 | R12 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Claude (Opus 5) | 1 | R03 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Claude (Opus 5) | 2 | R08 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Claude (Opus 5) | 3 | R15 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Claude (Opus 5) | 4 | R14 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Claude (Opus 5) | 5 | R09 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Gemini (3.1 Pro) | 1 | R05 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Gemini (3.1 Pro) | 2 | R04 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Gemini (3.1 Pro) | 3 | R02 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Gemini (3.1 Pro) | 4 | R07 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |
| Gemini (3.1 Pro) | 5 | R11 | 5 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR04-01, PR04-02, PR04-03, PR04-04, PR04-05 |

## 2. Por modelo (efetividade)

Média ± desvio-padrão das execuções; à direita, os totais somados e as métricas sobre eles (micro).

| Modelo | Precision | Recall | F1 | TP | FP | FN | Precision (micro) | Recall (micro) | F1 (micro) |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ChatGPT (GPT-5.6 Sol) | 0,90 ± 0,09 | 1,00 ± 0,00 | 0,95 ± 0,05 | 25 | 3 | 0 | 0,89 | 1,00 | 0,94 |
| Claude (Opus 5) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 25 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| Gemini (3.1 Pro) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 25 | 0 | 0 | 1,00 | 1,00 | 1,00 |

## 3. Frequência de detecção por defeito (estabilidade)

Sequência das execuções 1→5 (✓ detectou, ✗ não detectou), detecções e frequência.

| Defeito | Dificuldade | ChatGPT (GPT-5.6 Sol) | Claude (Opus 5) | Gemini (3.1 Pro) |
|---|:-:|:-:|:-:|:-:|
| **PR04-01** Estoque decrementado antes de concluir todas as validações | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR04-02** Limite calculado incluindo empréstimos já devolvidos | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR04-03** Livro que vence hoje é tratado como atrasado | Baixa | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR04-04** Histórico do mesmo livro impede novo empréstimo | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR04-05** Uso do relógio da máquina em vez da data controlada da operação | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
