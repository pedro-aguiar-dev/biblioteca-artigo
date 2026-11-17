# Protocolo de análise das respostas

Versão fixada em 2026-10-01, **antes** de qualquer resposta ser coletada ou lida.
Base: [GUIA] §7 e §19; [ESP] §8 "Classificação dos achados". Decisões do pesquisador: pontos A–D (seção 4).

## 1. Fluxo

1. **Coleta (pesquisador).** Cada resposta bruta, completa, é colada em `coleta/PRNN/<modelo>/execucao-N.md` (`chatgpt`, `claude`, `gemini`; N = 1…5). Só o texto da resposta — sem cabeçalho com nome do modelo. `registro.md` é preenchido com data, hora e link.
2. **Anonimização (assistente).** `node ferramentas/anonimizar-respostas.mjs PRNN` copia as 15 respostas para `coleta/PRNN/cegas/R01.md … R15.md` em ordem aleatória e grava o mapa em `coleta/PRNN/mapa-cego.json`. **O assistente não abre o mapa até concluir as 15 classificações.**
3. **Classificação cega (assistente).** Cada achado de cada resposta cega é registrado em `coleta/PRNN/classificacao.json`, com trecho citado, classificação, defeito associado e justificativa.
4. **Documento de revisão (assistente → pesquisador).** `coleta/PRNN/revisao-PRNN.md`: visão geral em uma tabela e, para cada resposta, os achados com a classificação e o porquê, em linguagem direta, com campo de concordância. O pesquisador revisa 100% dos achados; as divergências são resolvidas pelo pesquisador e registradas.
5. **Métricas (assistente).** Só após a revisão: abre-se o mapa e `node ferramentas/calcular-metricas.mjs PRNN` gera `coleta/PRNN/resultados-PRNN.md` com as métricas por execução, por modelo e por defeito.

## 2. Regras de classificação

| Situação | Classificação | Entra nas métricas? |
|---|---|---|
| Identifica o defeito conhecido, descreve o comportamento incorreto e aponta a causa essencial | **TP** do defeito | Sim |
| Aponta o comportamento incorreto de um defeito conhecido, mas com causa errada ou sem causa (detecção parcial) | **TP** do defeito, marcado como *parcial* (só informativo) | Sim, como TP (decisão A) |
| Mais de uma observação da mesma resposta com a mesma causa-raiz | Consolidadas: contam **uma** vez | — |
| Uma observação que cobre duas causas-raiz do ground truth | Um TP para cada defeito cuja causa estiver descrita | Sim |
| Problema fora do ground truth, **não comprovável** por teste contra os requisitos | **FP** | Sim |
| Problema fora do ground truth **comprovável** por teste contra os requisitos | **Defeito não planejado**: comprovar com teste e decidir com o pesquisador antes de calcular | Pendente |
| Achado vago, sem localização nem comportamento identificável | **Desconsiderado** | Não (decisão B) |
| Defeito conhecido não mencionado | **FN** | Sim |

Associação achado → defeito: tabela "Apoio à classificação" em `ground-truth/PRNN.md`.

## 3. Métricas

- Por execução: TP (defeitos distintos detectados), FP (problemas distintos), FN = defeitos do PR − TP.
  - Precision = TP/(TP+FP); se TP+FP = 0, **Precision = 0** (decisão C).
  - Recall = TP/(TP+FN).
  - F1 = 2·P·R/(P+R); se P+R = 0, F1 = 0.
- Por modelo: média e desvio-padrão amostral das 5 execuções; também os totais somados (TP, FP, FN) e as métricas sobre esses totais.
- Por defeito: frequência de detecção = execuções com TP / 5, por modelo (estabilidade).
- Consolidação posterior por PR, categoria, dificuldade esperada e conjunto completo.

## 4. Decisões do pesquisador (2026-10-01)

- **A — Detecção parcial** (comportamento certo, causa errada ou ausente): **conta como TP**. A marcação "parcial" é mantida só para transparência.
- **B — Achado vago**: **desconsiderado** (nem TP nem FP).
- **C — Execução sem nenhum achado válido**: **Precision = 0**.
- **D — Classificação**: o assistente (Claude, um dos modelos avaliados) classifica às cegas; o **pesquisador revisa 100%** a partir de um documento de revisão claro e autoexplicativo.
