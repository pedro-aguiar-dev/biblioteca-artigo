# Relatório completo do experimento: avaliação de LLMs em revisão de Pull Requests

**Sistema de Biblioteca — reconstrução integral do projeto, metodologia, implementação, execução, resultados e rastreabilidade**

Versão consolidada: 14 de outubro de 2026  
Estado do sistema: implementação concluída, todas as PRs corrigidas e validadas  
Repositório de código: `biblioteca-artigo`  
Acervo metodológico interno: `../biblioteca-experimento`

## 1. Finalidade deste documento

Este documento reconstrói o trabalho desde os dois documentos fornecidos no início do projeto até o encerramento das seis etapas experimentais. Foi escrito para uma pessoa que não acompanhou o desenvolvimento: apresenta a motivação, explica o sistema construído, registra as decisões tomadas, descreve como os defeitos foram implantados e validados, detalha a coleta e a classificação das respostas, consolida os resultados e aponta as limitações que devem ser consideradas no artigo.

O relatório também preserva a continuidade entre os assistentes. Claude participou da concepção, implementação e análise inicial; em 8 de outubro de 2026, por decisão do pesquisador após o encerramento de seu limite de uso, a continuidade operacional passou ao Codex. O trabalho não foi reiniciado: o Codex recuperou os documentos, o histórico Git, o registro de decisões e os artefatos já produzidos, manteve o protocolo predefinido e concluiu as etapas restantes.

## 2. Documentos de origem e evolução do desenho

O projeto começou com dois documentos fornecidos pelo pesquisador. A **Especificação de Requisitos do Sistema de Biblioteca para Avaliação de LLMs em Pull Requests**, versão 1.0, setembro de 2026, definiu o domínio, as entidades Livro, Usuário e Empréstimo, seis funcionalidades, regras de negócio, requisitos não funcionais e casos de teste. O **Guia experimental de implementação / Catálogo de defeitos controlados** transformou esse domínio em um benchmark: seis Pull Requests incrementais, 25 defeitos recomendados, três LLMs, cinco execuções por modelo e por PR, prompt universal, ground truth e métricas de precisão, revocação, F1 e frequência de detecção.

Havia uma divergência entre os documentos. Um trecho da especificação sugeria um único defeito por PR e uma correspondência direta entre PR e caso de teste; o guia definia de três a cinco defeitos por funcionalidade. O pesquisador decidiu que o guia prevaleceria. O desenho efetivamente executado teve seis PRs e 25 defeitos, distribuídos em 4, 4, 4, 5, 4 e 4 defeitos.

Os PDFs originais foram preservados em `documentacao-final/originais`. As versões atualizadas, que incorporam as decisões e o estado final, estão em `ESPECIFICACAO-ATUALIZADA.md` e `GUIA-EXPERIMENTAL-ATUALIZADO.md`.

## 3. Pergunta experimental e desenho executado

O experimento investiga a efetividade e a estabilidade de LLMs na identificação de defeitos funcionais introduzidos em diffs de Pull Requests. Foram comparados ChatGPT GPT-5.6 Sol, Claude Opus 5 e Gemini 3.1 Pro. Para cada PR, cada modelo realizou cinco revisões independentes sob uma entrada textual idêntica. Assim, a base válida contém 6 PRs × 3 modelos × 5 execuções = **90 respostas**.

Cada um dos 25 defeitos poderia ser detectado cinco vezes por cada um dos três modelos. Logo, o experimento contém **375 oportunidades de detecção**. A unidade de análise primária é o par execução-defeito; a unidade de estabilidade é a sequência binária de cinco detecções de um mesmo defeito por um mesmo modelo.

A progressão foi incremental: criar baseline correta; validar; inserir apenas os defeitos daquele PR; validar cada mutação; gerar o diff; coletar respostas; anonimizar; classificar; obter revisão integral do pesquisador; calcular métricas; corrigir; revalidar; usar a correção como baseline seguinte. Isso evitou acumular defeitos entre funcionalidades.

## 4. Sistema construído

Foi construída uma API backend em JavaScript, Node.js 24, módulos ES e Express 5. A organização é em rotas, serviços e repositórios. Os serviços concentram as regras de negócio; os repositórios mantêm dados em memória; as rotas expõem HTTP. A persistência em memória foi uma decisão deliberada porque permite observar mutabilidade de referências e forçar rollback de maneira determinística, condições necessárias para parte do catálogo de defeitos.

### 4.1 Entidades

- **Livro:** `id`, `isbn`, `title`, `author`, `totalCopies`, `availableCopies`.
- **Usuário:** `id`, `name`, `email`.
- **Empréstimo:** `id`, `userId`, `bookId`, `loanDate`, `dueDate`, `returnDate`, `renewalCount`.

IDs são inteiros positivos sequenciais. Datas civis usam `YYYY-MM-DD` em UTC. A data da operação é recebida explicitamente como `currentDate`, garantindo determinismo e evitando dependência do relógio da máquina.

### 4.2 API final

| Método e rota | Função | Resposta principal |
|---|---|---|
| `POST /books` | Cadastrar livro | 201 e livro criado |
| `GET /books` | Listar acervo | 200 e lista |
| `GET /books/search?q=...` | Pesquisar por título ou autor | 200 e correspondências |
| `POST /users` | Cadastrar usuário | 201 e usuário criado |
| `GET /users?page=&size=` | Listar usuários com paginação | 200 e página |
| `PATCH /users/:id/email` | Atualizar e-mail | 200 e usuário atualizado |
| `POST /loans` | Realizar empréstimo | 201 e empréstimo |
| `GET /loans` | Listar empréstimos | 200 e lista |
| `POST /loans/:id/return` | Registrar devolução | 200 e empréstimo |
| `POST /loans/:id/renew` | Renovar empréstimo | 200 e empréstimo |

Erros de negócio têm corpo `{"error":"CODIGO"}`. Entradas inválidas usam 400, recursos ausentes 404 e conflitos de estado ou unicidade 409.

### 4.3 Regras implementadas

O prazo inicial é de 14 dias corridos. Cada renovação acrescenta 7 dias ao vencimento vigente, no máximo três vezes. Um usuário pode manter até três empréstimos abertos, não pode ter dois abertos para o mesmo livro e fica impedido de realizar novo empréstimo quando possui outro realmente atrasado. Igualdade entre vencimento e data da operação ainda está dentro do prazo. Empréstimo exige estoque positivo e reduz uma unidade; devolução é permitida mesmo com atraso e devolve exatamente uma unidade; renovação não altera estoque. Operações rejeitadas não podem modificar o estado.

## 5. Alterações necessárias em relação aos documentos iniciais

As adaptações foram registradas antes da análise dos respectivos resultados.

1. **RF07 — atualização de e-mail.** Foi acrescentado para separar dois defeitos de unicidade do PR02 que, se ficassem na mesma operação de criação, poderiam mascarar um ao outro. A rota é `PATCH /users/:id/email`; o e-mail deve ser válido e único, o usuário deve existir e rejeições preservam os dados.
2. **Rotas auxiliares.** `GET /books`, `GET /users` e `GET /loans` apoiam inspeção e testes. A listagem paginada de usuários também torna realista o defeito PR02-05.
3. **PR03-04 adaptado de SQL para JavaScript.** Como não há banco de dados, o prefixo produzido por `LIKE 'termo%'` foi representado por `startsWith`, mantendo a causa comportamental.
4. **PR03-05 substituído por PR03-06.** O callback assíncrono em `filter` faria toda busca retornar todo o acervo e esconderia outros defeitos. O substituto limita indevidamente os resultados aos dez primeiros, preservando independência e completude como tema.
5. **PR04-05 restringido ao cálculo do vencimento.** Aplicar o relógio real também à verificação de atraso mascararia o defeito de fronteira PR04-03.
6. **Transação e helper preparados no PR04.** A transação em memória viabiliza o defeito de atomicidade da devolução; o helper `persistLoan` nasce correto no empréstimo para depois ser reutilizado indevidamente na renovação.

## 6. Preparação de cada Pull Request

Cada ciclo possui três estados rastreáveis por tags Git: `prNN-baseline`, `prNN-experimental` e `prNN-corrigido`. A baseline continha o comportamento esperado. A versão experimental continha somente os defeitos planejados. Depois da coleta, a correção restaurava equivalência funcional com a baseline e seguia no histórico principal.

| Etapa | Baseline | Experimental | Corrigido |
|---|---|---|---|
| PR01 | 941940c | 875f92a | b49c40d |
| PR02 | 51b1c14 | 171810a | 83f915a |
| PR03 | 706447f | 8849b0a | fecf519 |
| PR04 | 2fe55cf | 45d4f80 | 76257b9 |
| PR05 | 0233555 | 4c7880e | e88805e |
| PR06 | cb8281f | 607e870 | a9ea606 |

O repositório começou no commit `19f372b`, tag `pr00-estrutura`. Nenhuma versão foi enviada ao remoto durante a execução, reduzindo o risco de contaminação. O estado final está no `main`, commit `a9ea606`, tag `pr06-corrigido`.

## 7. Catálogo efetivamente usado

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

## 8. Validação interna e independência dos defeitos

Os testes permaneceram fora do repositório submetido às LLMs. Para cada PR foram usados: suíte de baseline, roteiro HTTP contra o servidor real, teste-oráculo por defeito, mutante isolado e matriz de independência. A baseline deveria passar em todos os oráculos; o mutante X deveria falhar apenas no oráculo X; a versão combinada deveria falhar em todos os oráculos daquela PR. Isso demonstrou que cada causa-raiz era observável e reduziu mascaramento.

Na versão final corrigida, **112 de 112 testes automatizados** passaram. Os roteiros HTTP passaram em sequência: PR01 10/10, PR02 15/15, PR03 8/8, PR04 10/10, PR05 6/6 e PR06 7/7. A execução sequencial é necessária porque os roteiros sobem servidor e compartilham porta/estado; uma tentativa paralela anterior gerou interferência espúria, posteriormente descartada pela repetição isolada.

## 9. Entrada fornecida às LLMs

Cada entrada seguiu a mesma ordem: prompt fixo, requisitos da funcionalidade, descrição neutra do PR e diff. O prompt pediu apenas defeitos funcionais e, para cada achado, localização, problema, comportamento esperado, comportamento atual e requisito. Não informou número de bugs, ground truth, testes ou resultados. O conteúdo de cada PR foi salvo em `submissoes/PRNN/entrada-llm.txt` e protegido por SHA-256.

O diff comparava a versão corrigida anterior com a versão experimental atual. Essa escolha simula uma revisão real de nova funcionalidade; comparar baseline e experimental da mesma PR revelaria quase exclusivamente as linhas das mutações. O contexto padrão foi de três linhas, exceto no PR06, em que foram usadas doze linhas para expor o helper necessário à interpretação do efeito indireto.

## 10. Coleta, anonimização e classificação

O protocolo recomendou conversa nova a cada execução, nenhum follow-up ou regeneração, memória e personalização desligadas, mesmo modelo/modo e entrada colada sem edição. As respostas brutas foram salvas antes da análise. Os modelos registrados foram GPT-5.6 Sol em eficiência média, Claude Opus 5 em eficiência média e Gemini 3.1 Pro.

As 15 respostas de cada PR foram embaralhadas e renomeadas R01 a R15. O mapa resposta-modelo permaneceu fechado durante a classificação. Cada achado foi comparado com a causa-raiz do ground truth. Detecção correta contou como TP; defeito controlado não detectado, FN; alegação funcional incorreta ou sem apoio, FP. Achado vago foi desconsiderado. Uma detecção comportamentalmente correta, mesmo com causa incompleta, seria TP parcial e ficaria marcada; repetições da mesma causa na mesma resposta foram consolidadas. Execução sem achado teria precision zero.

O pesquisador revisou 100% das classificações por documentos Word com uma linha por achado e coluna para decisão. O mapa só foi aberto e as métricas calculadas após aprovação. Não houve divergência registrada pelo pesquisador nas seis revisões.

### 10.1 Coleta inválida da PR06

A primeira entrada preparada para a PR06 não continha o corpo do helper `persistLoan`, embora o defeito PR06-05 dependesse de seu efeito colateral. Foram coletadas 15 respostas, mas a falha de contexto tornou a comparação inválida. O lote foi preservado como evidência, excluído das métricas oficiais e substituído por nova coleta com o helper visível e hash atualizado. Essa decisão impede que uma limitação da entrada seja interpretada como falha dos modelos.

## 11. Execução e resultado por Pull Request

### PR01 — Cadastro de livros (RF01)

A baseline foi registrada em `pr01-baseline (941940c)`; a versão submetida às LLMs em `pr01-experimental (875f92a)`. O material de revisão foi produzido por `git diff pr00-estrutura pr01-experimental`, e a entrada padronizada teve SHA-256 `36b3592468e44391af9a64b443c566a5914cd269b77d802824224874b3589d0b`.

- **PR01-01 — Verificação de ISBN condicionada também ao título.** Dificuldade: Média; categoria: Consulta / integridade; requisito: RF01 / CA02. Causa-raiz: A busca de duplicidade usa ISBN e título como critério (findOne({ isbn, title })); só encontra o registro existente quando os dois coincidem. Comportamento correto: Qualquer cadastro com ISBN já existente é rejeitado (ISBN_ALREADY_EXISTS, HTTP 409) e o acervo não muda. Comportamento defeituoso: Cadastro com ISBN repetido e título diferente é aceito (HTTP 201); o acervo passa a ter dois livros com o mesmo ISBN.
- **PR01-02 — Persistência realizada antes de todas as validações.** Dificuldade: Alta; categoria: Efeito colateral / ordem de execução; requisito: RF01 / CA03, CA04, CA05; RN08. Causa-raiz: O livro é persistido antes das validações de ISBN/título/autor e de quantidade; as validações só lançam o erro depois que o registro já foi criado. Comportamento correto: Cadastro inválido é rejeitado sem criar nenhum registro (CA05, RN08). Comportamento defeituoso: A API responde 400 (INVALID_BOOK ou INVALID_QUANTITY), mas o livro inválido permanece no acervo.
- **PR01-03 — Cliente consegue definir a disponibilidade inicial.** Dificuldade: Média; categoria: Estado / mass assignment; requisito: RF01 / CA01; RN09. Causa-raiz: A disponibilidade inicial é lida da entrada do cliente quando informada (input.availableCopies ?? totalCopies), em vez de ser derivada da quantidade total. Comportamento correto: availableCopies inicial é sempre igual a totalCopies; valor enviado pelo cliente é ignorado. Comportamento defeituoso: totalCopies = 5 e availableCopies = 1 produzem um livro com 1 exemplar disponível.
- **PR01-04 — Validação de quantidade baseada apenas em truthiness.** Dificuldade: Baixa; categoria: JavaScript / validação; requisito: RF01 / CA04. Causa-raiz: A validação de quantidade usa só truthiness (!totalCopies); números negativos (e outros valores truthy não inteiros) passam. Comportamento correto: totalCopies deve ser inteiro maior que zero; -1 é rejeitado com INVALID_QUANTITY. Comportamento defeituoso: totalCopies = -1 é aceito; o livro é criado com totalCopies e availableCopies = -1.

Resultado: ChatGPT (GPT-5.6 Sol): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Claude (Opus 5): TP=20, FP=1, FN=0, micro-P=0,95, micro-R=1,00, micro-F1=0,98; Gemini (3.1 Pro): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00.

### PR02 — Cadastro de usuários (RF02) e atualização de e-mail (RF07)

A baseline foi registrada em `pr02-baseline (51b1c14)`; a versão submetida às LLMs em `pr02-experimental (171810a)`. O material de revisão foi produzido por `git diff pr01-corrigido pr02-experimental`, e a entrada padronizada teve SHA-256 `32d41e24f81362f23314e9286ece188a8e49cad35707db0d89c88b396f154bc0`.

- **PR02-02 — Regra de atualização reutilizada incorretamente na criação.** Dificuldade: Média; categoria: Regra copiada / validação de unicidade; requisito: RF02 / CA07. Causa-raiz: A condição de duplicidade compara existingUser.id === input.id; na criação input.id é undefined, então a condição é sempre falsa e o duplicado é aceito. Comportamento correto: Cadastro com e-mail já existente é rejeitado (EMAIL_ALREADY_EXISTS, HTTP 409) e nada é criado. Comportamento defeituoso: Cadastro com e-mail já existente é aceito (HTTP 201); passam a existir dois usuários com o mesmo e-mail.
- **PR02-03 — Usuário salvo antes da validação.** Dificuldade: Alta; categoria: Estado parcial / ordem de execução; requisito: RF02 / CA08, CA09; RN08. Causa-raiz: O usuário é persistido antes da validação de nome/e-mail; quando a validação falha, o erro é lançado com o registro já criado. Comportamento correto: Tentativa inválida é rejeitada sem criar usuário (CA09, RN08). Comportamento defeituoso: A API responde 400 INVALID_USER, mas o usuário inválido permanece armazenado e aparece em GET /users.
- **PR02-04 — Validação rejeita somente quando nome e e-mail são inválidos ao mesmo tempo.** Dificuldade: Baixa; categoria: Lógica booleana; requisito: RF02 / CA08. Causa-raiz: As duas condições de invalidade são combinadas com && em vez de ||; cada uma deveria bastar para rejeitar. Comportamento correto: Nome vazio OU e-mail inválido causa rejeição (INVALID_USER). Comportamento defeituoso: Nome vazio com e-mail válido é aceito; nome válido com e-mail inválido (ou ausente) é aceito.
- **PR02-05 — Verificação de duplicidade baseada em listagem paginada.** Dificuldade: Alta; categoria: Consulta / arquitetura; requisito: RF07 / CA34, CA36 (no [GUIA]: RF02 / CA07). Causa-raiz: A unicidade é verificada com findAll({ page: 0, size: 100 }) e busca local; usuários fora dos 100 primeiros não são considerados. Comportamento correto: Atualizar para um e-mail de outro usuário é rejeitado (EMAIL_ALREADY_EXISTS, 409), independentemente da posição desse usuário. Comportamento defeituoso: Com mais de 100 usuários, atualizar para o e-mail de um usuário fora da primeira página é aceito; dois usuários ficam com o mesmo e-mail.

Resultado: ChatGPT (GPT-5.6 Sol): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Claude (Opus 5): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Gemini (3.1 Pro): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00.

### PR03 — Consulta ao acervo (RF03)

A baseline foi registrada em `pr03-baseline (706447f)`; a versão submetida às LLMs em `pr03-experimental (8849b0a)`. O material de revisão foi produzido por `git diff pr02-corrigido pr03-experimental`, e a entrada padronizada teve SHA-256 `7cde09e8aafb650a9cb1940bf6aef5e775d810530579bae905bcc5c7059fb3b7`.

- **PR03-01 — Apenas o termo pesquisado é normalizado para minúsculas.** Dificuldade: Baixa; categoria: Busca / case-insensitive; requisito: RF03 / CA11. Causa-raiz: matchesTerm converte só o termo (query = term.toLowerCase()) e compara com o texto original, sem text.toLowerCase(). Comportamento correto: A pesquisa não diferencia maiúsculas e minúsculas: 'clean', 'CLEAN' e 'Clean' encontram 'Clean Code'. Comportamento defeituoso: Texto com letras maiúsculas não é encontrado por termo em minúsculas (ex.: 'clean' não encontra 'Clean Code').
- **PR03-03 — Autor é pesquisado somente se nenhum título for encontrado.** Dificuldade: Média; categoria: Controle de fluxo / completude da busca; requisito: RF03 / CA10, CA12. Causa-raiz: O serviço pesquisa por título e usa a pesquisa por autor apenas como fallback quando o resultado por título é vazio. Comportamento correto: Com o termo no título de um livro e no autor de outro, os dois são retornados. Comportamento defeituoso: Se algum título corresponde, só os livros compatíveis pelo título são retornados; os compatíveis apenas pelo autor somem.
- **PR03-04 — Correspondência parcial implementada apenas como prefixo.** Dificuldade: Baixa; categoria: Consulta (no GUIA: Consulta / SQL — adaptado para JavaScript, X07); requisito: RF03 / CA10. Causa-raiz: A correspondência parcial usa startsWith em vez de includes; termos no meio ou no fim do texto não casam. Comportamento correto: Termo em qualquer posição do título ou do autor é encontrado (ex.: 'dados' encontra 'Estruturas de dados'). Comportamento defeituoso: Só são encontrados títulos/autores que começam pelo termo.
- **PR03-06 — Resultados limitados a uma quantidade fixa (substituto do PR03-05).** Dificuldade: Média (estimativa do assistente, aceita pelo pesquisador); categoria: Consulta / completude; requisito: RF03 / CA12 (CT08). Causa-raiz: O resultado é truncado com books.slice(0, MAX_SEARCH_RESULTS), MAX_SEARCH_RESULTS = 10. Comportamento correto: Todos os livros compatíveis são retornados (12 compatíveis → 12). Comportamento defeituoso: Com mais de 10 compatíveis, só os 10 primeiros voltam.

Resultado: ChatGPT (GPT-5.6 Sol): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Claude (Opus 5): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Gemini (3.1 Pro): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00.

### PR04 — Realização de empréstimos (RF04)

A baseline foi registrada em `pr04-baseline (2fe55cf)`; a versão submetida às LLMs em `pr04-experimental (45d4f80)`. O material de revisão foi produzido por `git diff pr03-corrigido pr04-experimental`, e a entrada padronizada teve SHA-256 `98eeace4a266a8ce5171e6cbbb00c80cf0e8d155a6ef9b1dd91f109b51aa0373`.

- **PR04-01 — Estoque decrementado antes de concluir todas as validações.** Dificuldade: Alta; categoria: Efeito colateral / fluxo; requisito: RF04 / CA17–CA21; RN08. Causa-raiz: A mutação do objeto book foi movida do bloco transacional de persistência para antes das validações restantes. Comportamento correto: Uma tentativa rejeitada preserva availableCopies. Comportamento defeituoso: Uma rejeição por limite, atraso ou duplicidade deixa availableCopies reduzido em uma unidade.
- **PR04-02 — Limite calculado incluindo empréstimos já devolvidos.** Dificuldade: Alta; categoria: Consulta / regra de negócio; requisito: RF04 / CA19; RN04. Causa-raiz: O limite usa findByUser e loans.length, em vez de findOpenByUser e openLoans.length. Comportamento correto: Somente empréstimos sem returnDate contam para o máximo de três. Comportamento defeituoso: Três empréstimos antigos devolvidos bloqueiam permanentemente um novo empréstimo.
- **PR04-03 — Livro que vence hoje é tratado como atrasado.** Dificuldade: Baixa; categoria: Data / condição de fronteira; requisito: RN07 / RF04 CA18. Causa-raiz: A condição usa dueDate <= operationDate em vez de dueDate < operationDate. Comportamento correto: Um empréstimo com dueDate igual à data da operação ainda está dentro do prazo. Comportamento defeituoso: O usuário é bloqueado na própria data de vencimento.
- **PR04-04 — Histórico do mesmo livro impede novo empréstimo.** Dificuldade: Alta; categoria: Consulta / estado do empréstimo; requisito: RN05 / RF04 CA20. Causa-raiz: A consulta usa findByUserAndBook em vez de findOpenByUserAndBook. Comportamento correto: O usuário pode pegar novamente um livro que já devolveu. Comportamento defeituoso: Qualquer empréstimo histórico do mesmo livro bloqueia novos empréstimos para sempre.
- **PR04-05 — Uso do relógio da máquina em vez da data controlada da operação.** Dificuldade: Alta; categoria: Temporal / determinismo; requisito: RNF01 / RN01 / RF04 CA15. Causa-raiz: addDays recebe new Date() em vez da data controlada currentDate. Comportamento correto: A data prevista é sempre currentDate + 14 dias. Comportamento defeituoso: A data prevista depende do relógio real da máquina e diverge da data formal da operação.

Resultado: ChatGPT (GPT-5.6 Sol): TP=25, FP=3, FN=0, micro-P=0,89, micro-R=1,00, micro-F1=0,94; Claude (Opus 5): TP=25, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Gemini (3.1 Pro): TP=25, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00.

### PR05 — Realização de devoluções (RF05)

A baseline foi registrada em `pr05-baseline (0233555)`; a versão submetida às LLMs em `pr05-experimental (4c7880e)`. O material de revisão foi produzido por `git diff pr04-corrigido pr05-experimental`, e a entrada padronizada teve SHA-256 `218df47678e208b36910919944530b8e4a43925a3bc4806038b29c629d008be1`.

- **PR05-01 — Estoque incrementado antes de verificar devolução duplicada.** Dificuldade: Alta; categoria: Efeito colateral / ordem de execução; requisito: RF05 / CA25–CA26; RN08–RN09. Causa-raiz: availableCopies é incrementado antes da verificação de returnDate. Comportamento correto: Tentativa duplicada preserva o estoque. Comportamento defeituoso: Segunda devolução aumenta o estoque e depois é rejeitada.
- **PR05-02 — Empréstimo atrasado não pode ser devolvido.** Dificuldade: Média; categoria: Reutilização incorreta de regra; requisito: RF05 / CA24. Causa-raiz: Validador de atraso é chamado na devolução. Comportamento correto: Atraso não bloqueia devolução. Comportamento defeituoso: Empréstimo vencido recebe OVERDUE_LOAN.
- **PR05-03 — Devolução restaura todo o estoque do livro.** Dificuldade: Média; categoria: Estado / quantidade disponível; requisito: RF05 / CA23; RN09. Causa-raiz: availableCopies recebe totalCopies em vez de ser incrementado em uma unidade. Comportamento correto: Uma devolução aumenta uma unidade. Comportamento defeituoso: Uma devolução libera todos os exemplares.
- **PR05-05 — Atualização do empréstimo e do estoque sem atomicidade.** Dificuldade: Alta; categoria: Persistência / consistência; requisito: RF05 / CA22–CA23; RN08. Causa-raiz: As duas gravações ocorrem sem runInTransaction. Comportamento correto: Falha parcial reverte empréstimo e estoque. Comportamento defeituoso: Falha ao salvar livro pode deixar o empréstimo devolvido.

Resultado: ChatGPT (GPT-5.6 Sol): TP=20, FP=1, FN=0, micro-P=0,95, micro-R=1,00, micro-F1=0,98; Claude (Opus 5): TP=20, FP=1, FN=0, micro-P=0,95, micro-R=1,00, micro-F1=0,98; Gemini (3.1 Pro): TP=15, FP=0, FN=5, micro-P=1,00, micro-R=0,75, micro-F1=0,86.

### PR06 — Renovação de empréstimos (RF06)

A baseline foi registrada em `pr06-baseline (cb8281f)`; a versão submetida às LLMs em `pr06-experimental (607e870)`. O material de revisão foi produzido por `git diff --unified=12 pr05-corrigido pr06-experimental`, e a entrada padronizada teve SHA-256 `367bcaa3c283b23f366b0e0376621c048056901096142eb7ec2766dc27b25477`.

- **PR06-01 — Renovação calculada a partir da data atual.** Dificuldade: Média; categoria: Regra temporal; requisito: RN02 / RF06 CA27. Causa-raiz: Soma sete dias a currentDate em vez do dueDate atual.
- **PR06-02 — Vencimento modificado antes de validar o limite.** Dificuldade: Alta; categoria: Mutabilidade / efeito colateral; requisito: RN03 / RF06 CA31–CA32. Causa-raiz: Altera dueDate antes de verificar renewalCount >= 3.
- **PR06-03 — Empréstimo que vence hoje é considerado atrasado.** Dificuldade: Baixa; categoria: Boundary temporal; requisito: RN07 / RF06 CA30. Causa-raiz: Compara dueDate <= operationDate em vez de <.
- **PR06-05 — Helper compartilhado altera estoque durante renovação.** Dificuldade: Alta; categoria: Reutilização / efeito colateral indireto; requisito: RF06 / CA29. Causa-raiz: Renovação chama persistLoan, que decrementa availableCopies.

Resultado: ChatGPT (GPT-5.6 Sol): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Claude (Opus 5): TP=20, FP=0, FN=0, micro-P=1,00, micro-R=1,00, micro-F1=1,00; Gemini (3.1 Pro): TP=15, FP=0, FN=5, micro-P=1,00, micro-R=0,75, micro-F1=0,86.

## 12. Resultados quantitativos

### 12.1 Métricas por PR e modelo

| PR | Modelo | TP | FP | FN | P micro | R micro | F1 micro |
|---|---|---:|---:|---:|---:|---:|---:|
| PR01 | ChatGPT (GPT-5.6 Sol) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR01 | Claude (Opus 5) | 20 | 1 | 0 | 0,95 | 1,00 | 0,98 |
| PR01 | Gemini (3.1 Pro) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR02 | ChatGPT (GPT-5.6 Sol) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR02 | Claude (Opus 5) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR02 | Gemini (3.1 Pro) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR03 | ChatGPT (GPT-5.6 Sol) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR03 | Claude (Opus 5) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR03 | Gemini (3.1 Pro) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR04 | ChatGPT (GPT-5.6 Sol) | 25 | 3 | 0 | 0,89 | 1,00 | 0,94 |
| PR04 | Claude (Opus 5) | 25 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR04 | Gemini (3.1 Pro) | 25 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR05 | ChatGPT (GPT-5.6 Sol) | 20 | 1 | 0 | 0,95 | 1,00 | 0,98 |
| PR05 | Claude (Opus 5) | 20 | 1 | 0 | 0,95 | 1,00 | 0,98 |
| PR05 | Gemini (3.1 Pro) | 15 | 0 | 5 | 1,00 | 0,75 | 0,86 |
| PR06 | ChatGPT (GPT-5.6 Sol) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR06 | Claude (Opus 5) | 20 | 0 | 0 | 1,00 | 1,00 | 1,00 |
| PR06 | Gemini (3.1 Pro) | 15 | 0 | 5 | 1,00 | 0,75 | 0,86 |

### 12.2 Resultado agregado

| Modelo | Execuções | TP | FP | FN | P micro | R micro | F1 micro | P média por execução | R média por execução | F1 médio por execução |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ChatGPT (GPT-5.6 Sol) | 30 | 125 | 4 | 0 | 0,9690 | 1,0000 | 0,9843 | 0,9767 | 1,0000 | 0,9872 |
| Claude (Opus 5) | 30 | 125 | 2 | 0 | 0,9843 | 1,0000 | 0,9921 | 0,9867 | 1,0000 | 0,9926 |
| Gemini (3.1 Pro) | 30 | 115 | 0 | 10 | 1,0000 | 0,9200 | 0,9583 | 1,0000 | 0,9167 | 0,9524 |

No total dos três modelos houve **365 TP, 6 FP e 10 FN**. A precisão micro global foi 0,9838, a revocação micro global foi 0,9733 e o F1 micro global foi 0,9786.

ChatGPT detectou as 125 oportunidades correspondentes aos 25 defeitos e teve quatro falsos positivos: três na PR04 e um na PR05. Claude também detectou as 125 oportunidades e teve dois falsos positivos: um na PR01 e um na PR05. Gemini não produziu falsos positivos, mas não detectou PR05-05 nem PR06-02 em nenhuma das cinco execuções, totalizando dez falsos negativos e 115 TP.

### 12.3 Estabilidade por defeito

| Defeito | Título | ChatGPT | Claude | Gemini |
|---|---|---:|---:|---:|
| PR01-01 | Verificação de ISBN condicionada também ao título | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR01-02 | Persistência realizada antes de todas as validações | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR01-03 | Cliente consegue definir a disponibilidade inicial | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR01-04 | Validação de quantidade baseada apenas em truthiness | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR02-02 | Regra de atualização reutilizada incorretamente na criação | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR02-03 | Usuário salvo antes da validação | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR02-04 | Validação rejeita somente quando nome e e-mail são inválidos ao mesmo tempo | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR02-05 | Verificação de duplicidade baseada em listagem paginada | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR03-01 | Apenas o termo pesquisado é normalizado para minúsculas | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR03-03 | Autor é pesquisado somente se nenhum título for encontrado | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR03-04 | Correspondência parcial implementada apenas como prefixo | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR03-06 | Resultados limitados a uma quantidade fixa (substituto do PR03-05) | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR04-01 | Estoque decrementado antes de concluir todas as validações | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR04-02 | Limite calculado incluindo empréstimos já devolvidos | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR04-03 | Livro que vence hoje é tratado como atrasado | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR04-04 | Histórico do mesmo livro impede novo empréstimo | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR04-05 | Uso do relógio da máquina em vez da data controlada da operação | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR05-01 | Estoque incrementado antes de verificar devolução duplicada | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR05-02 | Empréstimo atrasado não pode ser devolvido | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR05-03 | Devolução restaura todo o estoque do livro | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR05-05 | Atualização do empréstimo e do estoque sem atomicidade | 5/5 (100%) | 5/5 (100%) | 0/5 (0%) |
| PR06-01 | Renovação calculada a partir da data atual | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR06-02 | Vencimento modificado antes de validar o limite | 5/5 (100%) | 5/5 (100%) | 0/5 (0%) |
| PR06-03 | Empréstimo que vence hoje é considerado atrasado | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |
| PR06-05 | Helper compartilhado altera estoque durante renovação | 5/5 (100%) | 5/5 (100%) | 5/5 (100%) |

Dos 75 pares modelo-defeito, 73 tiveram frequência de 100%. Os dois pares restantes foram Gemini × PR05-05 e Gemini × PR06-02, ambos com 0%. Não houve frequência intermediária. Isso indica alta repetibilidade dentro de cada configuração, mas também mostra falhas sistemáticas: quando Gemini não identificou aquelas causas de atomicidade/mutação, a omissão se repetiu nas cinco execuções.

## 13. Interpretação dos achados

As PR01 a PR03 apresentaram efeito teto: todos os modelos detectaram todos os defeitos, e a diferenciação ocorreu apenas por um falso positivo do Claude na PR01. A PR04 também teve recall perfeito, mas três execuções do ChatGPT trataram o recebimento de `currentDate` como defeito, apesar de a própria interface defini-lo como entrada controlável; isso reduziu sua precisão.

A separação mais relevante surgiu nas PR05 e PR06. Gemini omitiu consistentemente o defeito de falta de atomicidade na devolução e a mutação do vencimento antes da validação do limite na renovação. Ambos exigem raciocinar sobre estado intermediário depois de uma falha: no primeiro, uma gravação pode sobreviver à falha da segunda; no segundo, a operação lança exceção depois de alterar uma referência persistida em memória. ChatGPT e Claude detectaram essas causas em 5/5.

Os resultados não sustentam uma ordenação universal de modelos. Claude obteve a melhor precisão micro agregada entre os modelos com recall completo; ChatGPT também teve recall completo, com mais FP; Gemini teve precisão perfeita, porém recall menor. A escolha prática depende do custo relativo de falsos positivos e omissões.

## 14. Ameaças à validade e limitações

- **Validade interna:** defeitos deliberados podem não representar toda a diversidade de falhas reais. A matriz de mutantes protege a independência observável, mas dois defeitos podem compartilhar linha ou tema.
- **Validade de construção:** a classificação traduz texto livre em TP/FP/FN. O protocolo anterior, a cegagem e a revisão integral reduzem subjetividade, mas não a eliminam.
- **Validade externa:** há um único sistema, linguagem JavaScript, backend pequeno, persistência em memória e 25 defeitos. Os resultados não devem ser generalizados automaticamente para outros domínios, linguagens ou grandes PRs.
- **Modelos e interfaces:** versões comerciais podem mudar. Os nomes e modos registrados descrevem a coleta feita, não versões futuras.
- **Metadados incompletos:** a partir da PR03, vários campos de data, hora, link de conversa e confirmação de configurações ficaram vazios nos registros. Horários de arquivo são evidência operacional, mas não substituem todos os metadados planejados.
- **Troca de assistente:** Claude participou das primeiras etapas e classificou PR01–PR02; Codex recuperou o histórico e classificou PR03–PR06. O mesmo protocolo foi mantido e todas as decisões foram revisadas pelo pesquisador, mas a mudança de classificador deve ser declarada.
- **Possível conflito de interesse do classificador:** Claude era também uma família avaliada nas primeiras PRs. A classificação foi cega quanto ao modelo e revisada pelo pesquisador.
- **Coleta inválida da PR06:** o primeiro lote foi excluído por contexto incompleto. A preservação e a repetição documentada evitam seleção silenciosa de resultados.
- **Amostra de repetição:** cinco execuções permitem observar estabilidade básica, mas oferecem poder estatístico limitado para inferência ampla.

## 15. Texto-base para a metodologia do artigo

Foi conduzido um experimento controlado e incremental com seis Pull Requests de uma API de biblioteca em JavaScript. Para cada PR, foi implementada e validada uma baseline correta, seguida de uma versão experimental contendo entre quatro e cinco defeitos funcionais deliberados e independentes. No total, foram utilizados 25 defeitos. Cada versão experimental foi submetida cinco vezes a três LLMs — ChatGPT GPT-5.6 Sol, Claude Opus 5 e Gemini 3.1 Pro — com prompt, requisitos, descrição e diff idênticos, totalizando 90 revisões válidas.

Antes da coleta, cada defeito foi documentado em um ground truth com causa-raiz, requisito violado, comportamento esperado e teste-oráculo. A independência foi verificada por mutantes isolados: a baseline deveria passar em todos os oráculos, cada mutante deveria falhar apenas em seu oráculo e a versão combinada deveria falhar em todos. Testes e ground truth ficaram fora do diff entregue às LLMs.

As respostas foram preservadas integralmente, anonimizadas e embaralhadas antes da classificação. Os achados foram classificados como verdadeiro positivo, falso positivo ou desconsiderado; defeitos do ground truth ausentes foram falsos negativos. A classificação foi revisada integralmente pelo pesquisador antes da abertura do mapa entre respostas e modelos. Foram calculadas precision, recall e F1 por execução, agregações por modelo e frequência de detecção por defeito nas cinco repetições. Após cada coleta, os defeitos foram corrigidos e a versão revalidada passou a ser a baseline do PR seguinte.

## 16. Texto-base para a seção de desenvolvimento

O sistema foi desenvolvido como API REST em Node.js 24, Express 5 e módulos ES, com separação entre rotas, serviços e repositórios em memória. A escolha de persistência em memória facilitou a execução determinística dos testes e permitiu observar efeitos de mutabilidade e atomicidade previstos no catálogo. As entidades principais foram livros, usuários e empréstimos.

O desenvolvimento ocorreu em seis incrementos. O primeiro implementou cadastro de livros; o segundo, cadastro e listagem de usuários e atualização de e-mail; o terceiro, consulta ao acervo; o quarto, realização de empréstimos; o quinto, devolução; e o sexto, renovação. As regras incluíram unicidade de ISBN e e-mail, busca parcial sem distinção de caixa, prazo inicial de 14 dias, máximo de três empréstimos abertos, bloqueio por atraso, proibição de duplicidade aberta, devolução com reposição unitária e até três renovações de sete dias.

Cada incremento teve uma versão correta, uma versão com defeitos deliberados e uma versão corrigida, identificadas por tags Git. A versão final corrigida passou em 112 testes automatizados e em 56 verificações HTTP distribuídas pelos seis roteiros. O histórico preserva tanto as versões avaliadas quanto as correções, permitindo reproduzir os diffs e confirmar o comportamento esperado.

## 17. Rastreabilidade dos artefatos

- Código final: `src/` neste repositório.
- Histórico de decisões e linha do tempo: `../biblioteca-experimento/DECISOES.md`.
- Ground truth: `../biblioteca-experimento/ground-truth/PR01..PR06.{md,json}`.
- Entradas e diffs: `../biblioteca-experimento/submissoes/PR01..PR06/`.
- Respostas e classificação: `../biblioteca-experimento/coleta/PR01..PR06/`.
- Resultados individuais: `resultados-PRNN.{md,json}` dentro de cada pasta de coleta.
- Matrizes de independência: `../biblioteca-experimento/resultados/PRNN-matriz-oraculos.md`.
- Testes: `../biblioteca-experimento/testes/` e `testes-manuais/`.
- Versão final: commit `a9ea606`, tag `pr06-corrigido`.

## 18. Estado de encerramento

As seis funcionalidades foram implementadas; os 25 defeitos foram inseridos, validados e submetidos; as 90 respostas oficiais foram coletadas, anonimizadas, classificadas e revisadas; as métricas foram calculadas; os defeitos foram corrigidos; e a versão final passou por validação completa. Não houve push para repositório remoto. Os documentos desta pasta consolidam o estado final sem apagar as fontes, os dados brutos ou os desvios registrados durante a execução.


# Apêndice A — registro integral de decisões, desvios e linha do tempo

O conteúdo abaixo é a trilha de auditoria mantida durante a execução. Ele é incluído integralmente para preservar decisões intermediárias, autorizações, ocorrências e validações que a narrativa principal sintetiza.


Documento interno. **Não** entra no repositório do sistema nem no material entregue às LLMs.
Serve de base para a seção de metodologia do artigo e para o **relatório final completo** pedido pelo pesquisador ao término dos 6 PRs (tudo o que foi feito e decidido, com ênfase nos resultados).

Documentos de referência:

- **[ESP]** Especificação de Requisitos do Sistema de Biblioteca para Avaliação de LLMs em Pull Requests, v1.0, set/2026.
- **[GUIA]** Guia de Inserção Controlada de Defeitos em Pull Requests (`Guia_Bugs_PRs_Biblioteca_Benchmark_LLMs_Dificuldades_Atualizadas_v2`).

Repositório do sistema: `c:\diversos\biblioteca-artigo`
Pasta interna (este arquivo, testes automatizados, oráculos): `c:\diversos\biblioteca-experimento`

---

## 1. Decisões de método e de implementação

| ID | Data | Decisão | Motivo | Quem decidiu |
|---|---|---|---|---|
| D01 | 2026-10-01 | O diff entregue às LLMs vai da baseline correta do PR anterior até a versão defeituosa do PR atual. | Simula um PR real de funcionalidade. Um diff entre a baseline e a versão defeituosa do mesmo PR mostraria só as linhas alteradas pelos defeitos. | Pesquisador |
| D02 | 2026-10-01 | A validação funcional da baseline é feita manualmente pelo pesquisador. Os testes automatizados (casos CT da [ESP] e oráculos) ficam na pasta interna, fora do repositório. Nenhum arquivo de teste vai para o repositório ou para o diff. | Testes no diff denunciariam os defeitos (falhariam na versão defeituosa) ou serviriam de pista. | Pesquisador |
| D03 | 2026-10-01 | Oráculos e ground truth ficam fora do repositório: no documento do pesquisador e, em forma executável, na pasta interna. | Isolar o ground truth do material avaliado. | Pesquisador |
| D04 | 2026-10-01 | Persistência em memória. Os repositórios devolvem a referência do objeto armazenado (alterar o objeto lido altera o estado guardado). Sem banco de dados. | Os defeitos PR04-01, PR05-01 e PR06-02 do [GUIA] (alteração do objeto antes da validação) só se manifestam como estão escritos nesse modelo; com banco real os objetos lidos seriam cópias e esses trechos não alterariam nada salvo. Atende RNF03 (sem serviços externos). | Assistente (pesquisador delegou: "o melhor e mais fácil") |
| D05 | 2026-10-01 | Node.js 24 com módulos ES, Express 5, API HTTP em camadas: rotas → serviço → repositório. | Permite o teste manual por HTTP; as regras ficam testáveis sem HTTP (RNF03). | Assistente, aprovado pelo pesquisador |
| D06 | 2026-10-01 | Commit inicial "PR00" só com a estrutura do projeto, sem regra de negócio. Tags de git por etapa: `prNN-baseline`, `prNN-experimental`, `prNN-corrigido`. A baseline fica no `main`; os defeitos ficam num branch `exp/prNN` (nome diferente da tag, para evitar ambiguidade no git). Mensagens de commit neutras (sem menção a defeitos). | O diff do PR01 contém somente o cadastro de livros; rastreabilidade de cada etapa. | Assistente |
| D07 | 2026-10-01 | Erros de negócio retornam um código identificável no corpo (`{"error": "CODIGO"}`), com HTTP 400 para dados inválidos e 409 para conflito de unicidade. Os códigos seguem os nomes usados nos trechos do [GUIA] (ex.: `INVALID_BOOK`, `INVALID_QUANTITY`, `ISBN_ALREADY_EXISTS`). | RNF04 (erros identificáveis). | Assistente |
| D08 | 2026-10-01 | ISBN: apenas obrigatório e único, sem validação de formato ou dígito verificador. ISBN, título e autor devem ser texto não vazio (só espaços conta como vazio). Texto não é normalizado (sem trim/maiúsculas) ao armazenar. Quantidade total deve ser número inteiro maior que zero. | A [ESP] (CA02–CA04) não exige formato; evitar regras além do especificado. | Assistente |
| D09 | 2026-10-01 | Campos em inglês, como nos trechos do [GUIA]: `id`, `isbn`, `title`, `author`, `totalCopies`, `availableCopies`. Identificadores numéricos sequenciais. | Consistência com os trechos do [GUIA]; IDs curtos facilitam o teste manual. | Assistente |
| D10 | 2026-10-01 | A pasta `.claude/` (configuração do assistente) é excluída via `.git/info/exclude` (local, não versionado), e não via `.gitignore`. Os diffs serão gerados com `git diff` (que não inclui mensagens de commit). | Nenhum arquivo do sistema nem do diff deve mencionar "Claude", um dos modelos avaliados. | Assistente |
| D11 | 2026-10-01 | Testes automatizados internos em `node:test` (sem dependências), executados contra o checkout atual do repositório; roteiro de teste manual em PowerShell para o pesquisador (`testes-manuais/`). | D02 + [ESP] §7. | Assistente |
| D12 | 2026-10-01 | A validação da baseline, prevista em D02 como manual pelo pesquisador, passou a ser executada pelo assistente: suíte automatizada interna + roteiro manual automatizado (`testes-manuais/PRNN-executar.ps1`, que sobe o servidor real e compara cada resposta HTTP com o esperado). | Pedido do pesquisador ("você mesmo teste para mim"). | Pesquisador |
| D13 | 2026-10-01 | Independência dos defeitos comprovada por **matriz de oráculos** (`ferramentas/matriz-oraculos.mjs`): cada oráculo é executado contra a baseline, contra cada defeito isolado (um mutante por defeito, em `mutantes/PRNN/`) e contra a versão experimental com todos os defeitos. Critério: a baseline passa em tudo; o mutante X falha só no oráculo X; a experimental falha em todos. Oráculos desenhados para não depender dos outros defeitos do mesmo PR (ex.: oráculo do PR01-04 verifica só o código do erro, em acervos separados). | [GUIA] §2 item 4 e §4 (causas-raiz independentes, sem mascaramento) e §5 item 13 (oráculo falha pelo motivo esperado). | Assistente |
| D14 | 2026-10-01 | Entrada das LLMs montada por `ferramentas/montar-entrada.mjs` na ordem do [GUIA] §18.1: prompt fixo ([GUIA] §18.4, literal) → requisitos → descrição do PR → diff. Arquivo único `submissoes/PRNN/entrada-llm.txt`, com hash SHA-256 registrado para comprovar entrada idêntica nos três modelos. **Requisitos**: texto literal da [ESP] para o RF do PR + RNs citadas pelo [GUIA] para os defeitos do PR + modelo de dados da entidade. **Descrição**: uma frase neutra sobre a funcionalidade e os endpoints. | [GUIA] §18 e checklist §15. **Texto dos requisitos e da descrição é proposta do assistente — revisar.** | Assistente (a revisar pelo pesquisador) |
| D15 | 2026-10-01 | Diff gerado com `git diff` padrão (3 linhas de contexto). Para o PR01 nenhum código de contexto extra é anexado: o único símbolo externo usado no diff é `AppError(código, status)`, de leitura evidente. | [GUIA] checklist §15 (contexto necessário para helpers chamados pelo diff). Reavaliar a cada PR. | Assistente |
| D17 | 2026-10-01 | Protocolo de coleta recomendado: conversa nova por execução; sem regenerar nem enviar mensagens de acompanhamento; memória, personalização e instruções personalizadas desligadas; mesmo modelo/modo durante toda a coleta; entrada colada como texto (nunca anexo), copiada do `entrada-llm.txt` sem edição; resposta bruta salva antes da classificação, com data/hora e link (`coleta/PRNN/registro.md`). | [GUIA] §2 itens 6–7, §15 e §20 itens 9–10. | Assistente (recomendação) |
| D18 | 2026-10-01 | Análise: respostas anonimizadas e embaralhadas (R01…R15, `ferramentas/anonimizar-respostas.mjs`) antes da classificação; mapa resposta→modelo aberto só depois de classificar e revisar tudo; regras fixadas antes de ver os dados (`coleta/protocolo-analise.md`). O assistente classifica às cegas (`classificacao.json`), gera o documento de revisão (`ferramentas/gerar-revisao.mjs`) e o pesquisador revisa 100%; métricas por `ferramentas/calcular-metricas.mjs`. Ferramentas testadas com dados fictícios antes da coleta. | O assistente é Claude, um dos modelos avaliados: reduzir viés de autopreferência na classificação. | Pesquisador (pontos A–D) e assistente (procedimento) |
| D20 | 2026-10-02 | Usuário: campos `id`, `name`, `email`. E-mail válido = texto no formato `algo@dominio.ext` (regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`); unicidade por comparação exata (sem normalizar maiúsculas/espaços, como em D08). Erros: `INVALID_USER` (400, cadastro com nome vazio ou e-mail inválido — nome do [GUIA]), `EMAIL_ALREADY_EXISTS` (409), `INVALID_EMAIL` (400, atualização com e-mail inválido), `USER_NOT_FOUND` (404), `INVALID_PAGINATION` (400). | [ESP] RF02 não define o formato de e-mail; regra simples e objetiva. | Assistente |
| D21 | 2026-10-06 | Consulta ao acervo: `GET /books/search?q=termo`. Termo ausente ou só com espaços → `INVALID_SEARCH_TERM` (400). Correspondência parcial (o termo em qualquer posição) e sem diferenciar maiúsculas de minúsculas, no título **ou** no autor; resultado na ordem de cadastro, cada livro uma vez, sem limite de quantidade; sem correspondência → lista vazia. O termo não é aparado nem normalizado além de minúsculas (coerente com D08). | [ESP] RF03 (CA10–CA13, CT07–CT09); a [ESP] não define o tratamento de termo vazio. | Assistente |
| D19 | 2026-10-01 | Regras de classificação: **A** detecção parcial (comportamento certo, causa errada/ausente) = **TP** (marcada "parcial" só por transparência); **B** achado vago = **desconsiderado** (nem TP nem FP); **C** execução sem achado válido = **Precision 0**; F1 = 0 quando P+R = 0; **D** classificação cega pelo assistente com revisão integral do pesquisador. Achados repetidos com a mesma causa na mesma resposta contam uma vez. | [GUIA] §7 e §16 (regra de parcial a definir no artigo). | Pesquisador |
| D16 | 2026-10-01 | Recomendação: não publicar no remoto GitHub (`pedro-aguiar-dev/biblioteca-artigo`) as tags/branches de baseline e experimentais antes do fim da coleta, ou manter o repositório privado. | Um repositório público com baseline e versão experimental expõe exatamente as linhas dos defeitos (contaminação se algum modelo tiver acesso à web). | Assistente (recomendação; nada foi publicado) |
| D22 | 2026-10-08 | A continuidade operacional do experimento, incluindo documentação, classificação cega, preparação dos PRs restantes e consolidação final, passa do Claude para o Codex. O protocolo de anonimização e revisão integral pelo pesquisador é mantido. Toda atividade deve ser registrada em detalhe neste documento e nos artefatos específicos de cada PR. | O limite de uso do Claude foi encerrado e o pesquisador decidiu prosseguir exclusivamente com o Codex. A troca do assistente que executa a classificação constitui um desvio metodológico e deve ser explicitada no artigo e considerada nas ameaças à validade. | Pesquisador |
| D23 | 2026-10-08 | PR04 usa datas civis no formato ISO `YYYY-MM-DD`, interpretadas em UTC. A entrada de `POST /loans` contém `userId`, `bookId` e `currentDate`; o empréstimo armazena `loanDate`, `dueDate`, `returnDate` e `renewalCount`. Identificadores devem ser inteiros positivos e a data deve existir no calendário. | Garante comparação determinística de datas, atende RNF01 e mantém o relógio da operação explícito e controlável nos testes. | Codex, em continuidade às decisões de arquitetura delegadas pelo pesquisador |
| D24 | 2026-10-08 | As pendências P04, P07 e P08 foram resolvidas conforme as propostas já registradas: PR04-05 troca `currentDate` por `new Date()` somente no cálculo de `dueDate`, preservando a independência de PR04-03; a baseline do PR04 usa transação em memória com snapshot/rollback; e o helper `persistLoan(loan, book)` nasce no PR04, onde sua redução de estoque é correta, para possibilitar a reutilização incorreta prevista no PR06-05. | Evitar mascaramento entre PR04-03 e PR04-05; garantir coerência futura do defeito de atomicidade PR05-05; e fazer PR06-05 representar uma reutilização plausível de helper existente, em vez de código artificial criado junto com o defeito. | Codex, aplicando as propostas registradas pelo Claude e a autorização do pesquisador para prosseguir |
| D25 | 2026-10-09 | PR05 expõe `POST /loans/:id/return` com `currentDate` no corpo. Entrada inválida gera `INVALID_RETURN` (400), empréstimo inexistente gera `LOAN_NOT_FOUND` (404) e devolução repetida gera `LOAN_ALREADY_RETURNED` (409). A devolução atrasada é aceita; data e incremento unitário são persistidos na mesma transação em memória. | Materializa RF05/CA22–CA26 de forma coerente com o formato temporal definido em D23 e com a transação introduzida em D24. | Codex, em continuidade às decisões de arquitetura delegadas pelo pesquisador |
| D26 | 2026-10-09 | PR06 expõe `POST /loans/:id/renew` com `currentDate`. Entrada inválida gera `INVALID_RENEWAL` (400); empréstimo inexistente, `LOAN_NOT_FOUND` (404); já devolvido, `LOAN_ALREADY_RETURNED` (409); atrasado, `OVERDUE_LOAN` (409); quarta renovação, `RENEWAL_LIMIT_REACHED` (409). A baseline persiste apenas o empréstimo. | Materializa RF06/CA27–CA32, preserva o relógio controlado de D23 e garante que renovação não altere o estoque. | Codex, em continuidade às decisões de arquitetura delegadas pelo pesquisador |

## 2. Divergências em relação aos documentos (revisar no artigo)

| ID | Documento | O que o documento diz | O que está sendo feito | Situação |
|---|---|---|---|---|
| X01 | [ESP] Resumo executivo e §8 | "Cada Pull Request experimental introduzirá um único defeito"; "PR01 corresponde a CT01, PR02 a CT02…" | Segue o [GUIA] e as instruções do pesquisador: 6 PRs, um por funcionalidade, com 3–5 defeitos cada (25 no total). | **Decidido pelo pesquisador (2026-10-01): vale o desenho do [GUIA].** O artigo deve descrever 6 PRs × 3–5 defeitos; o trecho da [ESP] fica superado. |
| X02 | [ESP] RF01 | Não prevê listagem de livros. | Endpoint auxiliar `GET /books` (lista todo o acervo) no PR01, para permitir a verificação manual de CA05/CT02 ("acervo inalterado"). Não é a consulta do RF03. | Registro |
| X03 | [GUIA] PR01-01, "forma correta" | `bookRepository.findByIsbn(isbn)` | `bookRepository.findOne({ isbn })`. O defeito acrescenta `title` ao critério. Assim o repositório é idêntico nas duas versões e não sobra método sem uso no diff (o que seria pista). | Equivalente — só registro |
| X04 | [ESP] §7 | Casos de teste automatizados. | CT01–CT20 automatizados na pasta interna (fora do repositório) + teste manual do pesquisador (ver D02). | Registro |
| X05 | [ESP] RF02 e [GUIA] PR02 | RF02 cobre só o cadastro de usuários; o [GUIA] coloca PR02-02 e PR02-05 na mesma checagem de unicidade do cadastro (P01). | **Decisão do pesquisador (2026-10-02):** manter os 4 defeitos do PR02 e acrescentar a funcionalidade **"Atualizar e-mail de usuário"**, não prevista na [ESP]. PR02-02 fica na criação; PR02-05 fica na checagem de unicidade da atualização. Requisitos adicionais propostos pelo assistente, numerados após os da [ESP]: **RF07 Atualizar e-mail de usuário** — CA33 o novo e-mail deve ser válido; CA34 o e-mail deve continuar único (não pode pertencer a outro usuário; manter o próprio é permitido); CA35 usuário inexistente → rejeição; CA36 atualização rejeitada não altera os dados. Endpoint `PATCH /users/:id/email`. O requisito do PR02-05 passa de "RF02/CA07" para "RF07/CA34". | **Desvio da [ESP] — descrever no artigo**; texto do RF07 a revisar pelo pesquisador |
| X07 | [GUIA] PR03-04 e PR03-05 | PR03-04 escrito em SQL (`WHERE LOWER(title) LIKE LOWER(:term \|\| '%')`), categoria "Consulta / SQL"; PR03-05 (filter com callback assíncrono) incluído no PR03. | PR03-04 implementado em JavaScript (`startsWith` no lugar de `includes`), mesma causa-raiz (correspondência só por prefixo); categoria passa a "Consulta" (sem SQL, por D04). **PR03-05 substituído** por decisão do pesquisador (2026-10-06), porque o `filter()` assíncrono faria toda busca devolver todo o acervo e mascararia PR03-01, PR03-03 e PR03-04 (P02). **Substituto escolhido pelo pesquisador (opção B, proposta pelo assistente): PR03-06 "Resultados limitados a uma quantidade fixa"** — a busca devolve só os 10 primeiros livros compatíveis; viola RF03/CA12 (e CT08); categoria "Consulta / completude"; dificuldade esperada **Média** (estimativa do assistente, aceita pelo pesquisador ao escolher a opção). Categoria "JavaScript assíncrono" deixa de ser representada no PR03. | **Desvio do [GUIA] — descrever no artigo** |
| X08 | [GUIA] PR04-05 | Substitui `currentDate` por `new Date()` tanto no cálculo do vencimento quanto na verificação de atrasos. | A mutação usa `new Date()` somente no cálculo do vencimento. A checagem de atraso continua usando `currentDate`; nela, o único defeito controlado é PR04-03 (`<=`). | **Adaptação para preservar independência:** aplicar o relógio real também na checagem faria o oráculo de PR04-03 falhar pela causa de PR04-05 e mascararia a fronteira temporal. Descrever no artigo. |
| X06 | [ESP] RF02 | Não prevê listagem de usuários. | Endpoint auxiliar `GET /users?page=&size=` (paginado; padrão page 0, size 20; size máximo 100), para verificação manual de CA09/CA36 — e é a listagem paginada que o PR02-05 reutiliza indevidamente. | Registro |

## 3. Pendências a decidir quando chegarmos ao PR

| ID | PR | Questão | Proposta inicial |
|---|---|---|---|
| P01 | PR02 | PR02-02 e PR02-05 estão na mesma checagem de e-mail duplicado; com o PR02-02 presente todo duplicado passa na criação e o PR02-05 fica invisível. | **Resolvida em 2026-10-02 (ver X05):** PR02-05 movido para a atualização de e-mail. |
| P02 | PR03 | `filter()` com callback assíncrono (PR03-05) devolve todos os livros e esconde PR03-01, PR03-03 e PR03-04 no resultado da busca. | **Decidida em 2026-10-06:** trocar o PR03-05 (X07); substituto a definir pelo pesquisador. |
| P03 | PR03 | PR03-04 está escrito em SQL (`LIKE`); com D04 não há SQL. | **Resolvida em 2026-10-06:** `startsWith` no lugar de `includes`; categoria "Consulta" (X07). |
| P04 | PR04 | PR04-03 e PR04-05 atuam na mesma linha da checagem de atraso; o `new Date()` do PR04-05 faz o oráculo do PR04-03 falhar. | **Resolvida em 2026-10-08 (D24/X08):** PR04-05 somente no cálculo do vencimento. |
| P05 | PR05 | PR05-02 fala em "validador criado para a renovação", mas a renovação só existe no PR06. | Reaproveitar o validador de atraso do empréstimo (PR04); mesma causa-raiz. |
| P06 | PR05 | PR05-01, PR05-03 e PR05-05 mexem na mesma linha do incremento; em cenário simples o PR05-03 esconde o PR05-01. | Manter, com oráculos em cenários específicos. |
| P07 | PR04/PR05 | PR05-05 (falta de transação) só é defeito coerente se o empréstimo (PR04) já usar transação; senão a baseline do PR04 teria o mesmo problema sem registro. | **Resolvida em 2026-10-08 (D24):** transação em memória introduzida na baseline do PR04. |
| P08 | PR06 | PR06-05 depende de um helper `persistLoan` que decrementa o estoque. | **Resolvida em 2026-10-08 (D24):** helper nasce corretamente no PR04 e poderá ser reutilizado incorretamente na renovação do PR06. |

## 4. Linha do tempo

- 2026-10-01 — Recebidos o [GUIA] e a [ESP]. Decisões D01–D11.
- 2026-10-01 — **PR00** commitado (`19f372b`, tag `pr00-estrutura`): `package.json` (Express 5.2.1), `src/server.js`, `src/app.js` (JSON + tratamento de erros), `src/shared/app-error.js`.
- 2026-10-01 — **PR01 baseline** implementado: `src/books/book.repository.js`, `book.service.js`, `book.routes.js`; `src/app.js` registra `/books`. Endpoints: `POST /books`, `GET /books`.
- 2026-10-01 — Pesquisador decide seguir o [GUIA] (X01) e delega a validação ao assistente (D12). Validação: 17/17 testes internos (`testes/baseline/pr01-cadastro-livros.test.js`) e 10/10 casos do roteiro contra o servidor real. Commit `941940c`, tag **`pr01-baseline`**.
- 2026-10-01 — **PR01 experimental**: 4 defeitos (PR01-01 a PR01-04) inseridos em `src/books/book.service.js`, branch `exp/pr01`, commit `875f92a`, tag **`pr01-experimental`**. Matriz de oráculos conforme (`resultados/PR01-matriz-oraculos.md`). Versão defeituosa executável (servidor sobe; CT01 funciona). Diff `pr00-estrutura..pr01-experimental`: 4 arquivos, +104 linhas, sem comentários nem pistas. Entrada `submissoes/PR01/entrada-llm.txt` (SHA-256 `36b35924…89d0b`). Ground truth: `ground-truth/PR01.md` e `.json`. **Aguardando a coleta das LLMs (5 execuções × 3 modelos).**
- 2026-10-01 — Decisões A–D de classificação (D19); protocolo fixado e ferramentas de análise testadas com dados fictícios antes da coleta.
- 2026-10-02 — **Coleta do PR01 concluída** pelo pesquisador (15 respostas). A pasta `coleta/PR01/gpt/` foi renomeada para `chatgpt/` (nome esperado pelo registro e pelo script). Anonimização: `R01…R15`, mapa em `mapa-cego.json` (não aberto). *Transparência:* ao listar a pasta para diagnosticar o nome, o assistente viu o tamanho em bytes dos arquivos originais por modelo; não consultou o tamanho dos arquivos cegos nem o mapa.
- 2026-10-02 — **Classificação cega do PR01** feita pelo assistente (`coleta/PR01/classificacao.json`) e documento de revisão gerado (`coleta/PR01/revisao-PR01.md`). Resultado cego: as 15 respostas encontraram os 4 defeitos; 1 achado FP de fronteira (R01, achado 6) e 1 consolidação (R01, achado 5 = PR01-02). **Aguardando a revisão do pesquisador.**
- 2026-10-02 — A pedido do pesquisador, o documento de revisão passa a ser entregue também em Word: `coleta/PR01/revisao-PR01.docx` (paisagem; uma linha por achado, código `RNN-n` na 1ª coluna e coluna amarela "Sua decisão" — em branco = concorda). Gerado por `ferramentas/gerar-revisao-docx.mjs`; lido de volta por `ferramentas/ler-revisao-docx.mjs` (→ `revisao-PR01-decisoes.json`). Leitura testada com preenchimento simulado. Lógica comum aos dois formatos em `ferramentas/revisao-comum.mjs`.
- 2026-10-02 — **Revisão do pesquisador concluída**: revisou os 62 achados e concordou com todas as classificações, inclusive o caso de fronteira R01-6 (FP); nenhuma alteração (`revisao-PR01-decisoes.json` vazio; registrado em `classificacao.json`). Só então o mapa cego foi aberto.
- 2026-10-02 — **Métricas do PR01** (`coleta/PR01/resultados-PR01.md` e `.json`): os 3 modelos detectaram os 4 defeitos nas 5 execuções (recall 1,00; frequência de detecção 100% para todos os defeitos e modelos). Único FP: R01 = Claude, execução 2 (observação condicional sobre Express 4) → Claude precision 0,96 ± 0,09, F1 0,98 ± 0,05 (micro 0,95 / 0,98); ChatGPT e Gemini 1,00 em tudo. *Nota para o artigo:* efeito teto no PR01 — os defeitos não diferenciaram os modelos em recall. *Nota de viés:* o único caso de julgamento foi classificado pelo assistente (Claude) contra a própria família de modelos, antes de conhecer o mapa, e confirmado pelo pesquisador.
- 2026-10-02 — **PR01 corrigido** (a pedido do pesquisador): `src/books/book.service.js` restaurado da baseline no branch `exp/pr01`, commit `b49c40d`, tag **`pr01-corrigido`**; `git diff pr01-baseline pr01-corrigido` vazio. `main` avançado por fast-forward (histórico: baseline → experimental → corrigido). Validação: suíte 17/17, oráculos 6/6 passando, roteiro 10/10. `pr01-corrigido` é a baseline de partida do PR02.
- 2026-10-02 — Pesquisador pede **relatório final completo** ao término dos 6 PRs (ênfase nos resultados). Decide P01: manter os 4 defeitos do PR02 + funcionalidade adicional "Atualizar e-mail de usuário" (X05). Decisões D20, X05, X06.
- 2026-10-02 — **PR02 baseline**: `src/users/user.repository.js`, `user.service.js`, `user.routes.js`; `src/app.js` registra `/users`. Endpoints `POST /users`, `GET /users?page=&size=`, `PATCH /users/:id/email`. Validação pelo assistente (D12): suíte interna 40/40 (17 PR01 + 23 PR02, `testes/baseline/pr02-cadastro-usuarios.test.js`), roteiro PR02 15/15 e PR01 10/10 contra o servidor real (`testes-manuais/PR02-executar.ps1`). Commit `51b1c14`, tag **`pr02-baseline`**.
- 2026-10-02 — **PR02 experimental**: 4 defeitos (PR02-02, 03, 04 em `createUser`; PR02-05 em `updateEmail`) em `src/users/user.service.js`, branch `exp/pr02`, commit `171810a`, tag **`pr02-experimental`**. Matriz de oráculos conforme (`resultados/PR02-matriz-oraculos.md`). Versão defeituosa executável (CT04 funciona; 9 falhas da suíte só no PR02; PR01 intacto). Diff `pr01-corrigido..pr02-experimental`: 4 arquivos, +142 linhas, sem comentários nem pistas. Entrada `submissoes/PR02/entrada-llm.txt` (221 linhas, SHA-256 `32d41e24…154bc0`); requisitos = RF02 literal da [ESP] + RF07 proposto (X05) + RN08. Ground truth: `ground-truth/PR02.md` e `.json`. O pesquisador já havia criado `coleta/PR02…PR06/{gpt,claude,gemini}/execucao-1..5.md` vazios (01/10); o script de anonimização passou a aceitar a pasta `gpt` (ou `chatgpt`) e recusa arquivos vazios.
- 2026-10-02 — **Coleta do PR02 concluída** pelo pesquisador (15 respostas, pastas `gpt/claude/gemini`). Anonimização R01…R15 sem alertas; mapa não aberto. **Classificação cega** (`coleta/PR02/classificacao.json`): as 15 respostas encontraram os 4 defeitos; nenhum FP, desconsiderado, parcial ou consolidação; 10 respostas têm trechos de "pontos verificados sem defeito"/exemplos, registrados como observação e não contados como achado. Documentos de revisão: `coleta/PR02/revisao-PR02.docx` (e `.md`), 60 achados.
- 2026-10-06 — **Revisão do pesquisador do PR02 concluída** ("feito"); `revisao-PR02.docx` sem nenhuma decisão escrita (60 achados, células em branco = concorda); nenhuma alteração. Só então o mapa foi aberto.
- 2026-10-06 — **Métricas do PR02** (`coleta/PR02/resultados-PR02.md` e `.json`): ChatGPT, Claude e Gemini com Precision = Recall = F1 = 1,00 ± 0,00 (TP 20, FP 0, FN 0 cada); frequência de detecção 5/5 (100%) para os 4 defeitos nos 3 modelos, inclusive o PR02-05 (Alta), que só se manifesta com mais de 100 usuários. *Nota para o artigo:* efeito teto também no PR02 — PR01 e PR02 somados: 240 detecções possíveis, 240 obtidas; único FP do experimento até aqui é o do PR01 (Claude, execução 2).
- 2026-10-06 — **PR02 corrigido** (autorizado pelo pesquisador): `src/users/user.service.js` restaurado da baseline no branch `exp/pr02`, commit `83f915a`, tag **`pr02-corrigido`**; `git diff pr02-baseline pr02-corrigido` vazio; `main` avançado por fast-forward. Validação: suíte 40/40, oráculos PR01+PR02 11/11 passando, roteiros PR01 10/10 e PR02 15/15. `pr02-corrigido` é a baseline de partida do PR03.
- 2026-10-06 — Pendências do PR03: **P02** decidida pelo pesquisador — **trocar o PR03-05** por outro defeito (aguardando qual); **P03** — PR03-04 adaptado de SQL (`LIKE 'termo%'`) para JavaScript (`startsWith` no lugar de `includes`), ver X07.
- 2026-10-06 — Pesquisador escolhe o substituto do PR03-05: opção B → **PR03-06 "Resultados limitados a uma quantidade fixa"** (X07). Decisão D21 (consulta).
- 2026-10-06 — **PR03 baseline**: `book.repository.js` ganha `searchByTitleOrAuthor` e a função `matchesTerm`; `book.service.js` ganha `searchBooks`; `book.routes.js` ganha `GET /books/search?q=`. Validação: suíte 53/53 (13 novos do PR03, `testes/baseline/pr03-consulta-acervo.test.js`), roteiros PR03 8/8, PR02 15/15 e PR01 10/10 (`testes-manuais/PR03-executar.ps1`; os 3 roteiros regravados em UTF-8 com BOM — antes o PowerShell 5.1 corrompia os acentos dos dados de teste, sem afetar as verificações). Commit `706447f`, tag **`pr03-baseline`**.
- 2026-10-06 — **PR03 experimental**: PR03-01 e PR03-04 em `matchesTerm` (mesma linha, causas distintas); PR03-03 em `searchBooks` + `searchByTitle`/`searchByAuthor`; PR03-06 em `searchBooks` (`MAX_SEARCH_RESULTS = 10`). Mutantes e versão experimental gerados por substituição exata a partir da baseline (cada trecho conferido como ocorrência única). Branch `exp/pr03`, commit `8849b0a`, tag **`pr03-experimental`**. Matriz conforme, inclusive com mutantes em dois arquivos (`resultados/PR03-matriz-oraculos.md`). Versão defeituosa executável (8 falhas da suíte, todas do PR03; PR01/PR02 intactos). Diff `pr02-corrigido..pr03-experimental`: 3 arquivos, +31 linhas, sem pistas; sem contexto extra (D15). Entrada `submissoes/PR03/entrada-llm.txt` (104 linhas, SHA-256 `7cde09e8…9fb3b7`); requisitos = RF03 literal da [ESP] + modelo de dados. Ground truth: `ground-truth/PR03.md` e `.json`. **Aguardando a coleta das LLMs.**
- 2026-10-06 — **Coleta do PR03 concluída** pelo pesquisador: 15 respostas brutas, sendo 5 em `gpt/`, 5 em `claude/` e 5 em `gemini/`. Os arquivos foram preenchidos entre 17:36 e 18:10. O `registro.md` não foi preenchido com data, hora, confirmações e links; essa ausência de metadados deve ser registrada como limitação da coleta e completada posteriormente apenas com informações verificáveis.
- 2026-10-08 — **Continuidade transferida para o Codex** por decisão do pesquisador (D22). Inspeção de recuperação confirmou: PR01 e PR02 concluídos até as métricas; PR03 com preparação e coleta completas, ainda sem anonimização, classificação, revisão ou métricas; PR04–PR06 apenas com os 15 arquivos vazios de coleta previamente criados. Próximo passo: anonimizar o PR03 sem abrir o mapa, classificar as 15 respostas cegas, gerar a revisão para o pesquisador e calcular as métricas somente após a revisão.
- 2026-10-08 — **Anonimização do PR03 concluída** por `ferramentas/anonimizar-respostas.mjs PR03`: as 15 respostas foram embaralhadas criptograficamente e copiadas para `coleta/PR03/cegas/R01.md` a `R15.md`; o vínculo com modelo e execução foi gravado em `mapa-cego.json`. O Codex não abriu nem consultou o mapa durante a classificação.
- 2026-10-08 — **Classificação cega do PR03 concluída pelo Codex** (`coleta/PR03/classificacao.json`), seguindo o protocolo fixado em 2026-10-01: 15 respostas, 60 achados contabilizados, todos TP completos; cada resposta identificou PR03-01, PR03-03, PR03-04 e PR03-06; nenhum TP parcial, FP, achado desconsiderado ou defeito não planejado. Cinco respostas (R04, R07, R08, R12 e R13) continham seções adicionais de cautela, pontos a confirmar ou verificações sem defeito; foram registradas como observações e não contabilizadas. Foram gerados `revisao-PR03.md` e `revisao-PR03.docx`. **Aguardando a revisão integral do pesquisador antes de abrir o mapa e calcular as métricas.**
- 2026-10-08 — **Revisão do pesquisador do PR03 concluída e aprovada integralmente**: `revisao-PR03.docx` foi lido por `ferramentas/ler-revisao-docx.mjs PR03`; 60 achados encontrados, nenhuma decisão divergente preenchida e nenhuma classificação alterada. A aprovação foi registrada em `classificacao.json` e `revisao-PR03-decisoes.json`. A partir deste ponto, o protocolo autoriza abrir o mapa cego e calcular as métricas.
- 2026-10-08 — **Métricas do PR03** (`coleta/PR03/resultados-PR03.md` e `.json`): ChatGPT, Claude e Gemini obtiveram Precision = Recall = F1 = 1,00 ± 0,00; cada modelo somou TP 20, FP 0 e FN 0; os quatro defeitos tiveram frequência de detecção 5/5 (100%) em cada modelo. O efeito teto observado nos PR01 e PR02 persistiu no PR03. Nos três primeiros PRs, houve 180 oportunidades de detecção (12 defeitos × 5 execuções × 3 modelos) e todas foram obtidas; permanece apenas o FP do Claude no PR01 como diferença de precisão acumulada.
- 2026-10-08 — **PR03 corrigido e encerrado**: restauração da busca case-insensitive com correspondência em qualquer posição, união da pesquisa por título e autor e remoção do limite de 10 resultados. O conteúdo corrigido de `book.repository.js` e `book.service.js` coincide com `pr03-baseline`. Validação automatizada: 68/68 testes passando. Roteiros HTTP, repetidos sequencialmente para evitar disputa pela mesma porta/servidor: PR01 10/10, PR02 15/15 e PR03 8/8. Uma tentativa inicial de executar os três roteiros em paralelo produziu interferência de estado/servidor e uma divergência espúria na listagem do PR01; a repetição isolada confirmou que não havia falha no código. Após autorização explícita do pesquisador, correção registrada no branch `exp/pr03`, commit `fecf519`, tag anotada **`pr03-corrigido`**; `main` avançado por fast-forward. `git diff pr03-baseline pr03-corrigido` vazio para os arquivos da funcionalidade. `pr03-corrigido` é a baseline de partida do PR04.
- 2026-10-08 — **Fontes originais recuperadas para o PR04**: os PDFs [GUIA] e [ESP], originalmente anexados à conversa do Claude, foram localizados no histórico local da sessão e extraídos temporariamente para leitura. O escopo foi recuperado literalmente: RF04/CA14–CA21, RN01, RN04–RN09, RNF01, CT10–CT15 e os cinco defeitos PR04-01 a PR04-05. Nenhuma reconstrução por memória foi usada para definir requisitos ou mutações.
- 2026-10-08 — **PR04 baseline implementada e validada** a partir de `pr03-corrigido`: entidade e repositório de empréstimos; `POST /loans` e `GET /loans`; validação de usuário/livro/data; prazo de 14 dias; disponibilidade; limite de três abertos; bloqueio por atraso; duplicidade apenas entre empréstimos abertos; persistência transacional em memória; helper `persistLoan`; utilitários determinísticos de data. Testes internos: 84/84 passando, incluindo 16 testes novos do PR04 e rollback forçado. Roteiro HTTP PR04: 10/10 conforme. Decisões D23–D24; P04, P07 e P08 resolvidas.
- 2026-10-08 — **PR04 baseline registrada**: commit `2fe55cf`, tag anotada **`pr04-baseline`** no `main`.
- 2026-10-08 — **PR04 experimental**: cinco defeitos inseridos somente em `src/loans/loan.service.js`, branch `exp/pr04`, commit `45d4f80`, tag anotada **`pr04-experimental`**. Matriz de independência conforme: baseline passa nos cinco oráculos; cada mutante isolado falha somente no oráculo correspondente; versão combinada falha nos cinco. A suíte completa experimental teve 73 aprovações e 16 falhas, todas em testes do PR04; PR01–PR03 permaneceram íntegros. Diff `pr03-corrigido..pr04-experimental`: 7 arquivos, +220 linhas, sem testes ou ground truth. Entrada padronizada: 329 linhas, SHA-256 `98eeace4a266a8ce5171e6cbbb00c80cf0e8d155a6ef9b1dd91f109b51aa0373` (RNF01 conferido literalmente contra a [ESP]). **Aguardando coleta das 15 respostas.**
- 2026-10-08 — **Auditoria final do pacote de coleta da PR04**: o SHA-256 calculado novamente para `submissoes/PR04/entrada-llm.txt` coincidiu com `98eeace4a266a8ce5171e6cbbb00c80cf0e8d155a6ef9b1dd91f109b51aa0373`; `ground-truth/PR04.json` foi analisado com sucesso como JSON; nenhuma ocorrência do hash provisório anterior permaneceu nas pastas do sistema e do experimento; a busca por pistas na entrada encontrou apenas o uso esperado da palavra “defeito” no prompt fixo e nenhuma menção a BUG, FIXME, TODO, Claude, Codex, oráculo, ground truth ou versão experimental. O repositório estava limpo em `exp/pr04`, no commit/tag `45d4f80`/`pr04-experimental`; `main` permaneceu em `2fe55cf`/`pr04-baseline`. O pacote está pronto para as cinco execuções independentes em cada um dos três modelos.
- 2026-10-09 — **Coleta da PR04 concluída pelo pesquisador**: confirmada a presença de 15 respostas brutas não vazias — cinco em `gpt/`, cinco em `claude/` e cinco em `gemini/`. Pelos horários de modificação dos arquivos, as respostas foram salvas entre 16:44 e 17:03 de 09/10/2026. O `registro.md` contém os modelos/modos usados (GPT-5.6 Sol, eficiência média; Claude Opus 5, eficiência média; Gemini 3.1 Pro), mas os campos de data/hora, conversa nova, memória/personalização e links não foram preenchidos; essa ausência é preservada como limitação documental, sem inferir dados não verificáveis.
- 2026-10-09 — **Anonimização e classificação cega da PR04 concluídas pelo Codex**: `ferramentas/anonimizar-respostas.mjs PR04` gerou `cegas/R01.md` a `R15.md` e `mapa-cego.json`; o mapa não foi aberto nem consultado. Seguindo o protocolo fixado em 01/10/2026, foram contabilizados 78 achados: 75 TP completos e 3 FP, sem TP parcial, achado vago ou defeito não planejado. Todas as 15 respostas detectaram os cinco defeitos controlados. R01, R10 e R13 também afirmaram que receber `currentDate` do cliente seria um defeito e exigiram relógio injetável; a alegação foi classificada como FP porque a interface da PR04 define explicitamente `currentDate` como entrada controlável e RNF01 apenas proíbe dependência direta do relógio da máquina. Alegações adicionais de R09, R12 e R15 sobre snapshot/rollback foram consolidadas com PR04-01 por compartilharem a mesma causa raiz. A observação não confirmada de R14 sobre métodos fora do diff não foi contabilizada. Gerados `classificacao.json`, `revisao-PR04.md` e `revisao-PR04.docx`. **Aguardando revisão integral do pesquisador; o mapa deve permanecer fechado e as métricas não devem ser calculadas antes da aprovação.**
- 2026-10-09 — **Revisão do pesquisador e métricas da PR04**: o pesquisador aprovou integralmente o documento (“seu documento está ok”). `ferramentas/ler-revisao-docx.mjs PR04` leu 78 achados e nenhuma decisão divergente; a aprovação foi registrada em `classificacao.json` e `revisao-PR04-decisoes.json`. Só então o mapa foi aberto pelo script de métricas. Resultados: todos os modelos detectaram os cinco defeitos nas cinco execuções (25 TP e 0 FN por modelo; recall 1,00 e frequência 5/5 para cada defeito). Claude Opus 5 e Gemini 3.1 Pro tiveram 0 FP, Precision/F1 1,00. ChatGPT GPT-5.6 Sol teve 3 FP, um nas execuções 2, 3 e 4: Precision média 0,90 ± 0,09, F1 médio 0,95 ± 0,05; micro-Precision 0,89 e micro-F1 0,94. Artefatos: `resultados-PR04.md` e `.json`.
- 2026-10-09 — **PR04 corrigido e encerrado**: `loan.service.js` voltou a reduzir o estoque dentro da transação e após todas as validações; o limite voltou a considerar somente empréstimos abertos; a comparação de atraso voltou a ser estrita; a duplicidade voltou a consultar somente empréstimos abertos do mesmo livro; e o vencimento voltou a partir de `currentDate`. `git diff --exit-code pr04-baseline -- src/loans/loan.service.js` confirmou equivalência com a baseline. Validação automatizada completa: 89/89 testes passando. Roteiros HTTP sequenciais: PR01 10/10, PR02 15/15, PR03 8/8 e PR04 10/10. Duas tentativas de `npm test` não executaram testes — a primeira foi bloqueada pela política do PowerShell para `npm.ps1`; a segunda, com `npm.cmd`, confirmou que o projeto não define script `test`; a suíte correta foi então executada diretamente com `node --test` sobre os testes internos. Uma primeira tentativa de gravar o Git foi bloqueada pelas permissões da pasta `.git` e não alterou o histórico; repetida com permissão autorizada, gerou commit `76257b9`, tag anotada **`pr04-corrigido`** e fast-forward de `main`. Nenhum push foi realizado. `pr04-corrigido` é a baseline de partida da PR05.
- 2026-10-09 — **Escopo e baseline da PR05 recuperados e implementados**: consulta aos textos extraídos dos PDFs originais confirmou RF05/CA22–CA26, CT16–CT17 e os quatro defeitos PR05-01, PR05-02, PR05-03 e PR05-05. A baseline acrescenta `LoanRepository.findById`, `LoanService.returnLoan` e `POST /loans/:id/return`; aceita empréstimo atrasado, rejeita repetição antes de mutar dados, incrementa exatamente uma unidade e atualiza empréstimo/estoque atomicamente. Decisão D25. Testes internos novos em `testes/baseline/pr05-devolucao.test.js`: registro da data, atraso aceito, duplicidade sem efeito, incremento unitário com vários exemplares, entradas inválidas e rollback forçado. Suíte completa: 97/97. Roteiro HTTP `PR05-executar.ps1`: 6/6. Baseline registrada no `main`, commit `0233555`, tag anotada **`pr05-baseline`**. Próxima etapa: criar os quatro mutantes isolados, oráculos e versão experimental da PR05.
- 2026-10-09 — **PR05 experimental preparada**: branch `exp/pr05`, commit `4c7880e`, tag anotada **`pr05-experimental`**. Foram inseridos PR05-01 (incremento antes da duplicidade), PR05-02 (validador de atraso na devolução), PR05-03 (estoque recebe `totalCopies`) e PR05-05 (duas persistências sem transação), todos em `loan.service.js`. Mutantes isolados e quatro oráculos foram criados. A primeira matriz mostrou que o oráculo PR05-05 também media o estoque alterado por PR05-01; o oráculo foi restringido ao `returnDate`, estado que distingue especificamente a ausência de rollback transacional. Na repetição, a matriz ficou conforme: baseline passa em tudo, cada mutante falha apenas no próprio oráculo e a versão combinada falha nos quatro. Suíte experimental: 101 testes, 91 aprovações e 10 falhas, todas na PR05; PR01–PR04 íntegros. Diff `pr04-corrigido..pr05-experimental`: 3 arquivos, +56 linhas. Entrada padronizada: 130 linhas, SHA-256 `218df47678e208b36910919944530b8e4a43925a3bc4806038b29c629d008be1`; JSON validado e busca por pistas sem ocorrências. Ground truth e registro de coleta criados. **Aguardando as 15 respostas da PR05.**
- 2026-10-09 — **Coleta, anonimização e classificação cega da PR05 concluídas**: confirmadas 15 respostas brutas não vazias, cinco por modelo, salvas entre 17:49 e 18:01. O `registro.md` permaneceu sem data/hora, confirmações e links; apenas modelos/modos estavam previamente registrados, portanto a lacuna é mantida como limitação documental. O Codex executou a anonimização e não abriu `mapa-cego.json`. A classificação cega contabilizou 55 TP completos, 2 FP e 5 FN: PR05-01, PR05-02 e PR05-03 foram detectados por 15/15 respostas; PR05-05 foi detectado por 10/15. R04, R10, R11, R12 e R15 omitiram PR05-05. R02 alegou uma regra não especificada de coerência cronológica da data de devolução e rejeitou `currentDate` fornecido na entrada; R08 alegou uma corrida condicional entre devoluções simultâneas que não é reproduzível no repositório fornecido; ambos foram classificados como FP. Não houve TP parcial. Gerados `classificacao.json`, `revisao-PR05.md` e `revisao-PR05.docx`. **Aguardando revisão integral do pesquisador antes de abrir o mapa e calcular métricas.**
- 2026-10-09 — **Revisão, métricas e correção da PR05 concluídas**: o pesquisador aprovou integralmente a revisão; o leitor encontrou 57 achados e nenhuma divergência. Após a abertura do mapa, ChatGPT e Claude detectaram os quatro defeitos em 5/5 execuções, cada um com um FP: Precision média 0,96 ± 0,09, Recall 1,00, F1 0,98 ± 0,05. Gemini detectou PR05-01, 02 e 03 em 5/5, mas PR05-05 em 0/5: Precision 1,00, Recall 0,75 e F1 0,86. A correção restaurou validação antes de mutação, aceitação de atrasados, incremento unitário e transação. Validação: 101/101 testes; roteiros HTTP PR01 10/10, PR02 15/15, PR03 8/8, PR04 10/10 e PR05 6/6. Commit `e88805e`, tag **`pr05-corrigido`**, `main` avançado por fast-forward; nenhum push. Esta é a baseline de partida da PR06.
- 2026-10-09 — **PR06 baseline e experimental preparadas**: escopo literal recuperado dos PDFs: RF06/CA27–CA32, RN02, RN03, RN07, RN08, CT18–CT20 e defeitos PR06-01, 02, 03 e 05. Baseline: `POST /loans/:id/renew`, prazo +7 a partir do vencimento, contador +1, estoque preservado, bloqueio apenas após vencimento, máximo de três; 108/108 testes e roteiro HTTP 7/7. Commit `cb8281f`, tag **`pr06-baseline`**. Experimental: branch `exp/pr06`, commit `607e870`, tag **`pr06-experimental`**; calcula a partir de `currentDate`, muda prazo antes do limite, usa `<=` e chama `persistLoan`, que reduz estoque. A primeira matriz mascarou PR06-02 porque a quarta tentativa repetia a mesma data; o oráculo passou a usar o dia seguinte, ainda dentro do prazo, e a matriz repetida ficou conforme. Suíte experimental: 112 testes, 104 aprovações e 8 falhas esperadas. Diff: 2 arquivos, +46 linhas. Entrada: 108 linhas, SHA-256 `2fd8158a466c0a9204f5bb6a24e0075c29c7c508d19935af6c4a5007f2f3347d`; JSON válido, sem pistas. **Aguardando as 15 respostas da PR06.**
- 2026-10-09 — **Primeira coleta da PR06 invalidada antes da classificação**: após anonimizar e ler cegamente as 15 respostas, observou-se que todas detectavam PR06-01, PR06-02 e PR06-03, mas nenhuma podia avaliar PR06-05; várias respostas declararam explicitamente que o corpo de `persistLoan` não estava no diff. A auditoria confirmou que a entrada de 108 linhas terminava três linhas após a assinatura do helper e omitia `book.availableCopies -= 1`. Isso viola D15 e o checklist do guia, pois a causa-raiz de PR06-05 não era identificável. Nenhuma classificação ou métrica foi produzida. A coleta inteira, incluindo respostas cegas e mapa, foi preservada sem alterações em `coleta/PR06-invalidada-sem-contexto-helper/` para rastreabilidade e não integrará os resultados. O diff foi regenerado com 12 linhas de contexto, expondo o corpo completo de `persistLoan`; nova entrada com 135 linhas e SHA-256 `367bcaa3c283b23f366b0e0376621c048056901096142eb7ec2766dc27b25477`. Os 15 arquivos oficiais de PR06 foram recriados vazios para uma coleta repetida. Este incidente deve constar na metodologia e nas ameaças à validade como falha detectada pelo controle de qualidade antes da mensuração.
- 2026-10-09 — **Coleta repetida e classificação cega da PR06 concluídas**: 15 novas respostas não vazias, salvas entre 18:38 e 18:41, foram anonimizadas; o novo mapa permaneceu fechado. A classificação da entrada corrigida contabilizou 55 TP completos, 0 FP e 5 FN. PR06-01, PR06-03 e PR06-05 foram detectados em 15/15 respostas; PR06-02 foi detectado em 10/15 e omitido por R07, R08, R09, R10 e R12. A mudança em relação à coleta invalidada confirma que a exposição do corpo de `persistLoan` tornou PR06-05 objetivamente identificável: passou de nenhuma seção principal na rodada inválida para 15/15 na rodada válida. Gerados `classificacao.json`, `revisao-PR06.md` e `revisao-PR06.docx`. **Aguardando revisão integral do pesquisador antes de abrir o mapa e calcular as métricas finais.**
- 2026-10-14 — **Revisão e métricas da coleta válida da PR06 concluídas**: o pesquisador aprovou a revisão e solicitou prosseguir sem iniciar ainda o relatório consolidado completo. `ler-revisao-docx.mjs` leu 55 achados e nenhuma divergência. Após a abertura do mapa, ChatGPT GPT-5.6 Sol e Claude Opus 5 obtiveram TP 20, FP 0, FN 0 e Precision/Recall/F1 1,00 em todas as execuções. Gemini 3.1 Pro obteve TP 15, FP 0, FN 5, Precision 1,00, Recall 0,75 e F1 0,86; detectou PR06-01, PR06-03 e PR06-05 em 5/5, mas PR06-02 em 0/5. Resultados gravados em `resultados-PR06.md` e `.json`.
- 2026-10-14 — **PR06 corrigido e experimento de implementação encerrado**: restauradas comparação estrita de atraso, validação do limite antes da mutação, cálculo de +7 dias sobre o vencimento vigente e persistência somente do empréstimo, sem efeito no estoque. A suíte completa passou em 112/112 testes. Roteiros HTTP sequenciais: PR01 10/10, PR02 15/15, PR03 8/8, PR04 10/10, PR05 6/6 e PR06 7/7. Correção registrada no commit `a9ea606`, tag anotada **`pr06-corrigido`**; `main` avançado por fast-forward. Nenhum push realizado. As seis PRs estão implementadas, coletadas, classificadas, revisadas, metrificadas e corrigidas. O relatório consolidado completo permanece deliberadamente não iniciado, conforme solicitação do pesquisador em 14/10/2026.


**Nota editorial:** a última entrada da linha do tempo registra que o relatório ainda não havia sido iniciado naquele instante, porque essa foi a instrução vigente em 14/10/2026. A solicitação posterior do pesquisador deu origem ao presente relatório e supera aquele estado histórico.
