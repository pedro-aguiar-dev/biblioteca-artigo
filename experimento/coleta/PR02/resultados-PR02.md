# Resultados — PR02 Cadastro de usuários (RF02) e atualização de e-mail (RF07)

Gerado em 2026-10-06T18:45:00.851Z a partir de `classificacao.json` (revisada) e `mapa-cego.json`. Regras: `coleta/protocolo-analise.md`.

## 1. Por execução

| Modelo | Exec. | Resposta | TP | FP | FN | Desc. | Precision | Recall | F1 | Defeitos encontrados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| ChatGPT (GPT-5.6 Sol) | 1 | R04 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| ChatGPT (GPT-5.6 Sol) | 2 | R12 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| ChatGPT (GPT-5.6 Sol) | 3 | R10 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| ChatGPT (GPT-5.6 Sol) | 4 | R01 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| ChatGPT (GPT-5.6 Sol) | 5 | R06 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Claude (Opus 5) | 1 | R14 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Claude (Opus 5) | 2 | R11 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Claude (Opus 5) | 3 | R13 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Claude (Opus 5) | 4 | R03 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Claude (Opus 5) | 5 | R08 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Gemini (3.1 Pro) | 1 | R15 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Gemini (3.1 Pro) | 2 | R05 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Gemini (3.1 Pro) | 3 | R07 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Gemini (3.1 Pro) | 4 | R02 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |
| Gemini (3.1 Pro) | 5 | R09 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR02-02, PR02-03, PR02-04, PR02-05 |

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
| **PR02-02** Regra de atualização reutilizada incorretamente na criação | Média | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR02-03** Usuário salvo antes da validação | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR02-04** Validação rejeita somente quando nome e e-mail são inválidos ao mesmo tempo | Baixa | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR02-05** Verificação de duplicidade baseada em listagem paginada | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
