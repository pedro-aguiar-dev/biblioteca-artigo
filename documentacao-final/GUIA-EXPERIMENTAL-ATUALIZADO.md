# Guia experimental atualizado — protocolo executado

**Versão 2.0 — atualização do catálogo e do procedimento após a conclusão do experimento**

## 1. Objetivo

Este guia registra o procedimento que foi realmente executado para comparar LLMs em revisão de Pull Requests. Ele atualiza o guia original sem apagar os desvios: seis incrementos funcionais, 25 defeitos, três modelos, cinco execuções independentes por modelo e 90 respostas oficiais válidas.

## 2. Configuração final

| Elemento | Configuração |
|---|---|
| Sistema | API de biblioteca |
| Linguagem | JavaScript |
| Ambiente | Node.js 24, ES modules, Express 5 |
| Persistência | memória |
| PRs | 6 |
| Defeitos | 25 |
| Modelos | GPT-5.6 Sol; Claude Opus 5; Gemini 3.1 Pro |
| Repetições | 5 por modelo e PR |
| Respostas válidas | 90 |
| Oportunidades de detecção | 375 |

## 3. Protocolo por PR

1. Partir da versão corrigida anterior.
2. Implementar a funcionalidade correta.
3. Validar a baseline com testes e HTTP.
4. Registrar commit e tag `prNN-baseline`.
5. Criar um mutante isolado por defeito e a versão combinada.
6. Executar a matriz: baseline passa; mutante falha só em seu oráculo; combinada falha em todos.
7. Registrar ground truth com causa-raiz e requisito.
8. Criar branch `exp/prNN`, commit e tag `prNN-experimental`.
9. Gerar o diff da correção anterior para a experimental.
10. Montar entrada na ordem prompt, requisitos, descrição e diff; registrar SHA-256.
11. Auditar ausência de pistas.
12. Coletar cinco respostas de cada modelo em conversas independentes.
13. Preservar respostas brutas.
14. Anonimizar e embaralhar como R01–R15.
15. Classificar sem abrir o mapa.
16. Submeter 100% dos achados à revisão do pesquisador.
17. Abrir o mapa somente após aprovação e calcular métricas.
18. Corrigir os defeitos, revalidar e registrar `prNN-corrigido`.

## 4. Prompt fixo

> Atue como revisor de código. Analise o Pull Request abaixo considerando os requisitos e regras de negócio fornecidos. Identifique defeitos funcionais introduzidos pelas alterações. Considere como defeito apenas algo que possa gerar comportamento incorreto ou violar um requisito. Não reporte questões de estilo, nomenclatura ou refatorações opcionais. O Pull Request pode conter zero ou mais defeitos. Para cada defeito encontrado, informe: localização; descrição do problema; comportamento esperado; comportamento atual; requisito relacionado.

Depois do prompt foram anexados os requisitos da funcionalidade, uma descrição neutra e o diff. Nunca foram enviados quantidade de bugs, testes-oráculo, resultados ou ground truth.

## 5. Catálogo final

| ID | Defeito | Dificuldade | Categoria | Requisito |
|---|---|---|---|---|
| PR01-01 | Verificação de ISBN condicionada também ao título | Média | Consulta / integridade | RF01 / CA02 |
| PR01-02 | Persistência realizada antes de todas as validações | Alta | Efeito colateral / ordem de execução | RF01 / CA03, CA04, CA05; RN08 |
| PR01-03 | Cliente consegue definir a disponibilidade inicial | Média | Estado / mass assignment | RF01 / CA01; RN09 |
| PR01-04 | Validação de quantidade baseada apenas em truthiness | Baixa | JavaScript / validação | RF01 / CA04 |
| PR02-02 | Regra de atualização reutilizada incorretamente na criação | Média | Regra copiada / validação de unicidade | RF02 / CA07 |
| PR02-03 | Usuário salvo antes da validação | Alta | Estado parcial / ordem de execução | RF02 / CA08, CA09; RN08 |
| PR02-04 | Validação rejeita somente quando nome e e-mail são inválidos ao mesmo tempo | Baixa | Lógica booleana | RF02 / CA08 |
| PR02-05 | Verificação de duplicidade baseada em listagem paginada | Alta | Consulta / arquitetura | RF07 / CA34, CA36 (no [GUIA]: RF02 / CA07) |
| PR03-01 | Apenas o termo pesquisado é normalizado para minúsculas | Baixa | Busca / case-insensitive | RF03 / CA11 |
| PR03-03 | Autor é pesquisado somente se nenhum título for encontrado | Média | Controle de fluxo / completude da busca | RF03 / CA10, CA12 |
| PR03-04 | Correspondência parcial implementada apenas como prefixo | Baixa | Consulta (no GUIA: Consulta / SQL — adaptado para JavaScript, X07) | RF03 / CA10 |
| PR03-06 | Resultados limitados a uma quantidade fixa (substituto do PR03-05) | Média (estimativa do assistente, aceita pelo pesquisador) | Consulta / completude | RF03 / CA12 (CT08) |
| PR04-01 | Estoque decrementado antes de concluir todas as validações | Alta | Efeito colateral / fluxo | RF04 / CA17–CA21; RN08 |
| PR04-02 | Limite calculado incluindo empréstimos já devolvidos | Alta | Consulta / regra de negócio | RF04 / CA19; RN04 |
| PR04-03 | Livro que vence hoje é tratado como atrasado | Baixa | Data / condição de fronteira | RN07 / RF04 CA18 |
| PR04-04 | Histórico do mesmo livro impede novo empréstimo | Alta | Consulta / estado do empréstimo | RN05 / RF04 CA20 |
| PR04-05 | Uso do relógio da máquina em vez da data controlada da operação | Alta | Temporal / determinismo | RNF01 / RN01 / RF04 CA15 |
| PR05-01 | Estoque incrementado antes de verificar devolução duplicada | Alta | Efeito colateral / ordem de execução | RF05 / CA25–CA26; RN08–RN09 |
| PR05-02 | Empréstimo atrasado não pode ser devolvido | Média | Reutilização incorreta de regra | RF05 / CA24 |
| PR05-03 | Devolução restaura todo o estoque do livro | Média | Estado / quantidade disponível | RF05 / CA23; RN09 |
| PR05-05 | Atualização do empréstimo e do estoque sem atomicidade | Alta | Persistência / consistência | RF05 / CA22–CA23; RN08 |
| PR06-01 | Renovação calculada a partir da data atual | Média | Regra temporal | RN02 / RF06 CA27 |
| PR06-02 | Vencimento modificado antes de validar o limite | Alta | Mutabilidade / efeito colateral | RN03 / RF06 CA31–CA32 |
| PR06-03 | Empréstimo que vence hoje é considerado atrasado | Baixa | Boundary temporal | RN07 / RF06 CA30 |
| PR06-05 | Helper compartilhado altera estoque durante renovação | Alta | Reutilização / efeito colateral indireto | RF06 / CA29 |

## 6. Adaptações do catálogo

- PR03-04 foi traduzido de SQL para `startsWith` em JavaScript.
- PR03-05 foi substituído por PR03-06, limite fixo de dez resultados, porque o defeito original mascarava os demais.
- PR04-05 foi aplicado somente ao cálculo de vencimento para preservar a independência de PR04-03.
- O RF07 separou a atualização de e-mail do cadastro no PR02.
- A transação em memória e o helper `persistLoan` foram introduzidos corretamente antes de serem alvos de defeitos posteriores.
- O diff do PR06 usou doze linhas de contexto para incluir o corpo do helper.

## 7. Regras de classificação

TP exige identificação do comportamento defeituoso correspondente ao ground truth. Causa incompleta com comportamento correto conta como TP parcial e recebe marca explícita. Alegação incorreta conta como FP. Texto genérico sem defeito verificável é desconsiderado. Cada defeito do ground truth não detectado conta como FN. Repetições da mesma causa em uma resposta são consolidadas. Precision = TP/(TP+FP), recall = TP/(TP+FN) e F1 = 2PR/(P+R); denominadores vazios resultam em zero conforme o protocolo.

## 8. Controle de viés

As respostas foram cegadas antes da classificação, o mapa ficou fechado, e o pesquisador revisou integralmente os achados antes do cálculo. A passagem de Claude para Codex em 8/10/2026 foi registrada como desvio; o protocolo permaneceu o mesmo. A coleta inicial inválida da PR06 foi preservada e excluída por falta do contexto necessário ao helper, antes do resultado oficial.

## 9. Resultado de validação do protocolo

As seis matrizes de oráculos atenderam ao critério de independência. A versão final passou em 112 testes e em todos os roteiros HTTP. As métricas oficiais somaram 365 TP, 6 FP e 10 FN. O detalhamento encontra-se em `RELATORIO-COMPLETO-EXPERIMENTO.md` e nos arquivos `../biblioteca-experimento/coleta/PRNN/resultados-PRNN.*`.

## 10. Checklist para reprodução

- Usar os commits/tags registrados, sem reconstruir manualmente os diffs.
- Verificar o SHA-256 da entrada.
- Manter testes e ground truth fora da submissão.
- Fixar modelo e modo em cada série.
- Abrir uma conversa por execução e não fazer follow-up.
- Registrar data, hora, link e configurações; essa etapa teve lacunas no estudo original e deve ser melhorada.
- Preservar resposta bruta antes de qualquer normalização.
- Classificar cegamente e manter trilha de decisões.
- Distinguir precisão, revocação e estabilidade por defeito.
- Relatar qualquer lote inválido e sua justificativa.
