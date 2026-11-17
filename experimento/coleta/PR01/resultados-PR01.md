# Resultados — PR01 Cadastro de livros (RF01)

Gerado em 2026-10-02T18:29:10.572Z a partir de `classificacao.json` (revisada) e `mapa-cego.json`. Regras: `coleta/protocolo-analise.md`.

## 1. Por execução

| Modelo | Exec. | Resposta | TP | FP | FN | Desc. | Precision | Recall | F1 | Defeitos encontrados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| ChatGPT (GPT-5.6 Sol) | 1 | R14 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| ChatGPT (GPT-5.6 Sol) | 2 | R09 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| ChatGPT (GPT-5.6 Sol) | 3 | R06 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| ChatGPT (GPT-5.6 Sol) | 4 | R05 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| ChatGPT (GPT-5.6 Sol) | 5 | R11 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Claude (Opus 5) | 1 | R04 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Claude (Opus 5) | 2 | R01 | 4 | 1 | 0 | 0 | 0,80 | 1,00 | 0,89 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Claude (Opus 5) | 3 | R07 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Claude (Opus 5) | 4 | R13 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Claude (Opus 5) | 5 | R08 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Gemini (3.1 Pro) | 1 | R03 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Gemini (3.1 Pro) | 2 | R15 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Gemini (3.1 Pro) | 3 | R02 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Gemini (3.1 Pro) | 4 | R12 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |
| Gemini (3.1 Pro) | 5 | R10 | 4 | 0 | 0 | 0 | 1,00 | 1,00 | 1,00 | PR01-01, PR01-02, PR01-03, PR01-04 |

## 2. Por modelo (efetividade)

Média ± desvio-padrão das execuções; à direita, os totais somados e as métricas sobre eles (micro).

| Modelo | Precision | Recall | F1 | TP | FP | FN | Precision (micro) | Recall (micro) | F1 (micro) |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ChatGPT (GPT-5.6 Sol) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| Claude (Opus 5) | 0,96 ± 0,09 | 1,00 ± 0,00 | 0,98 ± 0,05 | 20 | 1 | 0 | 0,95 | 1,00 | 0,98 |
| Gemini (3.1 Pro) | 1,00 ± 0,00 | 1,00 ± 0,00 | 1,00 ± 0,00 | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |

## 3. Frequência de detecção por defeito (estabilidade)

Sequência das execuções 1→5 (✓ detectou, ✗ não detectou), detecções e frequência.

| Defeito | Dificuldade | ChatGPT (GPT-5.6 Sol) | Claude (Opus 5) | Gemini (3.1 Pro) |
|---|:-:|:-:|:-:|:-:|
| **PR01-01** Verificação de ISBN condicionada também ao título | Média | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR01-02** Persistência realizada antes de todas as validações | Alta | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR01-03** Cliente consegue definir a disponibilidade inicial | Média | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
| **PR01-04** Validação de quantidade baseada apenas em truthiness | Baixa | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) | ✓✓✓✓✓ 5/5 (100%) |
