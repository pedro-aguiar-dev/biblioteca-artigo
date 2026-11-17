# Revisão da classificação — PR01 Cadastro de livros (RF01)

As 15 respostas aparecem só como R01…R15, em ordem aleatória: nem o número nem a ordem indicam o modelo. A correspondência com os modelos só é aberta depois desta revisão.

## Como revisar

1. Leia o **gabarito** abaixo: são os defeitos que foram inseridos de propósito.
2. Olhe a **visão geral** para ter o quadro completo.
3. Comece pelos **pontos que pedem sua atenção**: são os únicos casos que envolveram julgamento.
4. Em cada resposta, leia cada achado e troque `[ ]` por `[x]` em **Concordo** ou **Discordo**. Se discordar, escreva a classificação que você daria.
5. Para ler uma resposta inteira, use o link **resposta completa**.

## Legenda

| Classificação | Significado | Conta nas métricas? |
|---|---|---|
| **TP** | Encontrou um defeito do gabarito. | Sim |
| **TP parcial** | Apontou o comportamento errado de um defeito do gabarito, mas com causa errada ou sem causa. | Sim, como TP (decisão A) |
| **FP** | Apontou um problema que não está no gabarito e não é comprovável pelos requisitos. Repetições do mesmo problema na mesma resposta contam uma vez. | Sim |
| **Desconsiderado** | Comentário vago, sem localização ou comportamento identificável. | Não (decisão B) |
| **Não encontrou** | Defeito do gabarito que a resposta não mencionou (FN). | Sim |

## Gabarito do PR01

| Defeito | O que é, em uma frase | Onde |
|---|---|---|
| **PR01-01** — Verificação de ISBN condicionada também ao título | ISBN repetido só é barrado se o título também for igual. | `src/books/book.service.js` — BookService.createBook — checagem de ISBN duplicado (linha 11) |
| **PR01-02** — Persistência realizada antes de todas as validações | O livro é salvo antes de ser validado: o cadastro inválido retorna erro, mas fica gravado. | `src/books/book.service.js` — BookService.createBook — save (linhas 17–23) antes das validações (linhas 25–31) |
| **PR01-03** — Cliente consegue definir a disponibilidade inicial | O availableCopies enviado pelo cliente é usado no lugar da quantidade total. | `src/books/book.service.js` — BookService.createBook — objeto passado ao save (linha 22) |
| **PR01-04** — Validação de quantidade baseada apenas em truthiness | A checagem !totalCopies deixa passar quantidade negativa. | `src/books/book.service.js` — BookService.createBook — validação da quantidade (linha 29) |

## Visão geral

| Resposta | PR01-01 | PR01-02 | PR01-03 | PR01-04 | FP | Desconsiderados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| [R01](#r01) | ✓ | ✓ | ✓ | ✓ | 1 | 0 |
| [R02](#r02) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R03](#r03) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R04](#r04) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R05](#r05) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R06](#r06) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R07](#r07) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R08](#r08) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R09](#r09) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R10](#r10) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R11](#r11) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R12](#r12) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R13](#r13) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R14](#r14) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R15](#r15) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |

✓ = encontrou · ✓ parcial = encontrou o comportamento, causa errada/ausente · — = não encontrou

## Pontos que pedem sua atenção

São os únicos casos que envolveram julgamento. O restante dos achados corresponde diretamente ao gabarito.

**Classificações fora de TP (FP, desconsiderado, parcial, não planejado):**

- [R01](#r01) · achado 6 → **FP** — Não é defeito no sistema: o projeto usa Express 5 (5.2.1), que encaminha erros de handlers async ao handleError — a suíte interna confirma respostas 400/409 corretas. Pela regra, problema fora do ground truth e não comprovável = FP. CASO DE FRONTEIRA: a resposta apresenta isso como observação condicional ('vale confirmar'), fora da lista de defeitos; se você entender que não foi relatado como defeito, reclassifique como Desconsiderado.

**Achados consolidados (repetem a causa de outro achado da mesma resposta):**

- [R01](#r01) · achado 5 → mesma causa do achado 1, conta uma vez.

**Trechos das respostas que não foram contados como achado:**

- [R01](#r01) — O achado 6 vem de uma 'Observação adicional' no fim da resposta (fora da lista de defeitos). Caso de fronteira — ver justificativa.
- [R04](#r04) — O parágrafo final ('Observação sobre a correção') só sugere a ordem correta do método; não é achado.
- [R05](#r05) — O parágrafo final dá um exemplo do mesmo problema do achado 2; não é achado separado.
- [R07](#r07) — A 'Observação complementar' só sugere a ordem correta do método e a própria resposta diz que não é defeito; não é achado.
- [R08](#r08) — O achado 1 traz, dentro dele, uma 'observação adicional' (livros inválidos com isbn undefined passam a casar com novas tentativas sem ISBN). É consequência do próprio PR01-02 e foi tratada como parte do achado 1, não como achado separado.
- [R09](#r09) — O parágrafo final só sugere o fluxo correto do método; não é achado.
- [R11](#r11) — O parágrafo final comenta a combinação dos achados 2 e 3; não é achado separado.
- [R13](#r13) — O parágrafo final comenta a combinação dos achados 1 e 3; não é achado separado.
- [R14](#r14) — O parágrafo final reforça a gravidade do achado 2; não é achado separado.

---

## R01

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 1 · Desconsiderados: 0** · [resposta completa](cegas/R01.md)

*Observação:* O achado 6 vem de uma 'Observação adicional' no fim da resposta (fora da lista de defeitos). Caso de fronteira — ver justificativa.

### R01 · Achado 1 → TP · PR01-02

> o livro é gravado no repositório antes de qualquer verificação de validade. Quando a validação falha, o erro é lançado, mas o registro já foi inserido

**Por quê:** Aponta a causa (save antes das validações) e o efeito (cadastro inválido retorna erro, mas fica no acervo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 2 → TP · PR01-01

> o critério combina dois campos com AND. A duplicidade só é detectada quando ISBN e título coincidem.

**Por quê:** Aponta a causa (findOne com isbn e title) e o efeito (dois livros com o mesmo ISBN quando o título difere).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 3 → TP · PR01-03

> a quantidade disponível é controlada pelo cliente em vez de ser derivada da quantidade total (availableCopies: input.availableCopies ?? totalCopies)

**Por quê:** Aponta a causa (availableCopies lido da entrada) e o efeito (disponível inicial diferente do total, inclusive fora de [0, total]).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 4 → TP · PR01-04

> o teste de falsidade só barra 0, undefined, null, NaN e string vazia. Valores negativos, não numéricos e fracionários passam.

**Por quê:** Aponta a causa (validação por truthiness, !totalCopies) e o efeito (quantidade negativa aceita). Citar também texto/fracionário é a mesma causa.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 5 → TP · PR01-02 — repete o achado 1, conta uma vez

> com isbn ausente, a busca é feita com isbn: undefined. Como já existem registros inválidos gravados pelo defeito 1 (...), cadastros subsequentes sem ISBN retornam 409 ISBN_ALREADY_EXISTS em vez do erro de validação correto.

**Por quê:** Efeito do mesmo PR01-02: só existem registros sem ISBN no acervo porque cadastros inválidos são gravados — a própria resposta atribui a causa ao 'defeito 1'. Sem o PR01-02 esse 409 não aconteceria. Mesma causa-raiz do achado 1; conta uma vez (previsto na tabela de apoio do ground truth).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 6 → FP

> os handlers são async e não possuem try/catch nem next(err). Isso só funciona se o projeto usar Express 5 (...); em Express 4 as rejeições não chegam ao handleError e a requisição fica pendente até o timeout. Vale confirmar a versão no package.json.

**Por quê:** Não é defeito no sistema: o projeto usa Express 5 (5.2.1), que encaminha erros de handlers async ao handleError — a suíte interna confirma respostas 400/409 corretas. Pela regra, problema fora do ground truth e não comprovável = FP. CASO DE FRONTEIRA: a resposta apresenta isso como observação condicional ('vale confirmar'), fora da lista de defeitos; se você entender que não foi relatado como defeito, reclassifique como Desconsiderado.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R02

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R02.md)

### R02 · Achado 1 → TP · PR01-01

> A verificação de duplicidade está exigindo a combinação exata de isbn e title para considerar que o livro já existe. Isso permite cadastrar múltiplos livros com o mesmo ISBN, desde que tenham títulos diferentes.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito com título diferente).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 2 → TP · PR01-02

> O sistema salva o livro no repositório (this.bookRepository.save(...)) antes de executar as validações dos dados (...). Se uma dessas validações falhar, o erro é lançado, mas o registro já foi persistido indevidamente.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (registro inválido persistido apesar do erro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 3 → TP · PR01-04

> A validação de quantidade está apenas verificando se a variável é um valor do tipo 'falsy' (...). Valores negativos (como -5) são considerados 'truthy' em JavaScript e vão passar indevidamente pela validação.

**Por quê:** Aponta a causa (!totalCopies, truthiness) e o efeito (quantidade negativa aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 4 → TP · PR01-03

> A definição de availableCopies está utilizando o valor vindo do input do usuário (...) (input.availableCopies ?? totalCopies). Isso permite que o cliente envie na requisição uma quantidade disponível diferente da quantidade total.

**Por quê:** Aponta a causa (availableCopies vindo da entrada) e o efeito (disponível inicial diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R03

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R03.md)

### R03 · Achado 1 → TP · PR01-01

> A verificação de duplicidade de ISBN está considerando a combinação de isbn e title (findOne({ isbn, title })). (...) O sistema permite cadastrar dois livros com o mesmo ISBN, desde que tenham títulos diferentes

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito com título diferente).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 2 → TP · PR01-02

> A instrução para salvar o livro no repositório (this.bookRepository.save(...)) está ocorrendo antes das validações (...). Mesmo que o cadastro seja inválido e lance um erro (...), o livro já terá sido persistido na memória (#books), poluindo o acervo.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (livro inválido fica no acervo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 3 → TP · PR01-04

> A validação da quantidade total (if (!totalCopies)) avalia apenas se o valor é falsy (como 0, null ou undefined), o que não impede números negativos.

**Por quê:** Aponta a causa (truthiness) e o efeito (quantidade negativa aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 4 → TP · PR01-03

> A definição de exemplares disponíveis está aceitando valores externos (availableCopies: input.availableCopies ?? totalCopies).

**Por quê:** Aponta a causa (availableCopies vindo da entrada) e o efeito (livro salvo com disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R04

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R04.md)

*Observação:* O parágrafo final ('Observação sobre a correção') só sugere a ordem correta do método; não é achado.

### R04 · Achado 1 → TP · PR01-02

> O livro é gravado no repositório antes de qualquer validação de campos obrigatórios e de quantidade. Quando a validação falha, a exceção é lançada, mas o registro inválido já foi inserido no acervo e permanece lá.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (registro inválido permanece no acervo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 2 → TP · PR01-01

> O critério de busca exige que ISBN e título coincidam. A unicidade passa a ser da combinação, não do ISBN isolado.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (dois livros com o mesmo ISBN).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 3 → TP · PR01-03

> a quantidade disponível pode ser informada pelo cliente, sobrescrevendo a regra de inicialização. (...) { totalCopies: 5, availableCopies: 99 } cria um livro com 99 disponíveis de 5 totais

**Por quê:** Aponta a causa (availableCopies vindo da entrada) e o efeito (disponível diferente do total, fora de [0, total]).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 4 → TP · PR01-04

> A checagem rejeita apenas valores falsy (0, undefined, null, ""). Valores numéricos negativos, não inteiros e strings numéricas passam na validação.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito). O comentário sobre string numérica quebrar operações futuras é a mesma causa.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R05

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R05.md)

*Observação:* O parágrafo final dá um exemplo do mesmo problema do achado 2; não é achado separado.

### R05 · Achado 1 → TP · PR01-01

> A validação de unicidade do ISBN depende também do título. Um livro com ISBN já existente, mas título diferente, não será encontrado como duplicado.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito com título diferente).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 2 → TP · PR01-02

> O livro é persistido antes de ser validado. Quando ISBN, título, autor ou quantidade são inválidos, uma exceção é lançada somente após a alteração do acervo.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (acervo alterado em operação rejeitada).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 3 → TP · PR01-04

> A validação da quantidade total não rejeita números negativos. (...) A condição só rejeita valores falsy. Por exemplo, totalCopies: -1 passa pela validação e é cadastrado.

**Por quê:** Aponta a causa (truthiness) e o efeito (quantidade negativa aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 4 → TP · PR01-03

> O cliente pode definir arbitrariamente a quantidade disponível no cadastro. (...) Se o cliente enviar availableCopies, esse valor é persistido.

**Por quê:** Aponta a causa (availableCopies vindo da entrada, linha citada) e o efeito (disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R06

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R06.md)

### R06 · Achado 1 → TP · PR01-02

> o livro é salvo no repositório antes de validar ISBN, título, autor e quantidade total. Se a entrada for inválida, uma exceção é lançada, mas o registro já foi incluído no acervo.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (registro inválido no acervo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 2 → TP · PR01-01

> a busca por duplicidade exige que ISBN e título coincidam simultaneamente. Assim, um livro com ISBN já cadastrado pode ser inserido caso tenha outro título.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 3 → TP · PR01-04

> a condição verifica apenas se totalCopies é um valor falsy. Valores negativos, como -1, são truthy em JavaScript e passam pela validação.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 4 → TP · PR01-03

> durante o cadastro, o valor enviado pelo cliente em availableCopies é utilizado. Isso permite criar, por exemplo, um livro com totalCopies: 5 e availableCopies: 2, 10 ou -1.

**Por quê:** Aponta a causa (availableCopies vindo da entrada) e o efeito (disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R07

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R07.md)

*Observação:* A 'Observação complementar' só sugere a ordem correta do método e a própria resposta diz que não é defeito; não é achado.

### R07 · Achado 1 → TP · PR01-02

> O livro é gravado no repositório e só depois os dados são validados. Quando a validação falha, a exceção é lançada, mas o registro inválido já foi inserido no array interno e recebeu um id, sem qualquer rollback.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (registro inválido permanece).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 2 → TP · PR01-01

> O critério de busca combina isbn e title, e o findOne do repositório exige que todas as condições sejam satisfeitas (conditions.every). Logo, a duplicidade só é detectada quando ISBN e título coincidem simultaneamente.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 3 → TP · PR01-03

> A quantidade disponível é derivada do corpo da requisição quando informada, em vez de ser sempre igual à quantidade total. Não há nenhuma validação sobre esse valor

**Por quê:** Aponta a causa (availableCopies vindo da entrada) e o efeito (disponível fora do esperado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 4 → TP · PR01-04

> O teste !totalCopies só barra valores falsy (0, undefined, null, "", NaN). Não verifica se o valor é numérico nem se é positivo. (...) São aceitos valores como -5, 2.5, "abc", "3" ou true.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo e não inteiros aceitos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R08

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R08.md)

*Observação:* O achado 1 traz, dentro dele, uma 'observação adicional' (livros inválidos com isbn undefined passam a casar com novas tentativas sem ISBN). É consequência do próprio PR01-02 e foi tratada como parte do achado 1, não como achado separado.

### R08 · Achado 1 → TP · PR01-02

> O livro é gravado no repositório antes de qualquer verificação de campos obrigatórios e de quantidade. Quando a validação falha, a exceção é lançada, mas o registro inválido já foi inserido em #books (...). Não há rollback.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (registro inválido no acervo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 2 → TP · PR01-01

> O findOne do repositório exige que todos os critérios casem (conditions.every). Ao incluir title, um ISBN já existente deixa de ser detectado se o título for diferente.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 3 → TP · PR01-04

> A checagem por valor falsy rejeita 0, undefined e null, mas aprova qualquer número negativo (-3 é truthy). Também aceita valores não numéricos como "5" ou "abc".

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 4 → TP · PR01-03

> O campo quantidade disponível deveria ser derivado internamente (...). Ao aceitar o valor enviado na requisição, o cliente controla esse campo livremente, sem qualquer validação de faixa.

**Por quê:** Aponta a causa (availableCopies vindo da entrada) e o efeito (disponível maior que o total ou negativo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R09

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R09.md)

*Observação:* O parágrafo final só sugere o fluxo correto do método; não é achado.

### R09 · Achado 1 → TP · PR01-01

> A unicidade do ISBN é verificada junto com o título. O repositório só encontra um livro quando ISBN e título são iguais. Assim, é possível cadastrar outro livro com o mesmo ISBN e título diferente.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 2 → TP · PR01-02

> O livro é persistido antes da validação dos campos. Se ISBN, título, autor ou quantidade forem inválidos, uma exceção é lançada somente depois de o acervo já ter sido alterado.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (acervo alterado em operação rejeitada).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 3 → TP · PR01-04

> A validação não garante que a quantidade total seja maior que zero. O teste verifica apenas se o valor é falsy. Valores negativos, por exemplo -1, são truthy em JavaScript e são aceitos.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 4 → TP · PR01-03

> O cliente consegue definir a quantidade disponível no cadastro. (...) Com {totalCopies: 10, availableCopies: 3}, o livro é criado com 3 disponíveis.

**Por quê:** Aponta a causa (availableCopies vindo da entrada, linha citada) e o efeito (disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R10

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R10.md)

### R10 · Achado 1 → TP · PR01-01

> A busca de verificação de duplicidade está filtrando livros que tenham, simultaneamente, o mesmo ISBN e o mesmo título. (...) O sistema permite cadastrar um livro com um ISBN que já existe, desde que o título seja diferente

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 2 → TP · PR01-02

> O livro está sendo salvo no repositório em memória antes que a validação dos campos (título, autor, ISBN e quantidade) aconteça. Se os dados forem inválidos, a exceção será lançada, porém o livro já terá sido inserido no array do repositório.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (registro inválido no acervo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 3 → TP · PR01-04

> A expressão !totalCopies falha apenas para valores falsy (como 0, null, undefined), mas não impede valores numéricos negativos, já que números negativos são avaliados como truthy em JavaScript.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 4 → TP · PR01-03

> O código permite que o usuário da API envie no payload (corpo da requisição) o campo availableCopies (quantidade disponível) com um valor diferente de totalCopies.

**Por quê:** Aponta a causa (availableCopies vindo da entrada, linha citada) e o efeito (disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R11

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R11.md)

*Observação:* O parágrafo final comenta a combinação dos achados 2 e 3; não é achado separado.

### R11 · Achado 1 → TP · PR01-01

> A verificação de unicidade considera ISBN e título conjuntamente, embora apenas o ISBN deva ser único. (...) Um livro com ISBN já existente pode ser cadastrado se possuir título diferente.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 2 → TP · PR01-02

> O livro é persistido antes de validar campos obrigatórios e quantidade. Quando uma validação falha posteriormente, o registro inválido já foi incluído no repositório.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (livro inválido aparece em GET /books).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 3 → TP · PR01-04

> A validação não garante que a quantidade total seja maior que zero. Valores negativos são truthy em JavaScript e passam pela validação.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 4 → TP · PR01-03

> O cadastro aceita availableCopies fornecido pelo cliente, permitindo criar o livro com disponibilidade diferente da quantidade total e até fora do intervalo permitido.

**Por quê:** Aponta a causa (availableCopies vindo da entrada, linha citada) e o efeito (disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R12

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R12.md)

### R12 · Achado 1 → TP · PR01-01

> A busca para verificar se o ISBN já existe está exigindo que o isbn e o title sejam iguais aos do banco de dados. Se o usuário enviar um ISBN já existente, mas informar um título diferente, o sistema não encontrará o registro e permitirá a duplicação do ISBN.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 2 → TP · PR01-02

> O livro é salvo no banco de dados (this.bookRepository.save(...)) antes de as regras de validação (campos vazios e quantidade de cópias) serem executadas.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (livro inválido persistido apesar da exceção).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 3 → TP · PR01-04

> A expressão !totalCopies rejeita apenas valores 'falsy' (como 0, null ou undefined). Como números negativos (ex: -5) são considerados valores 'truthy' no JavaScript, a validação não os bloqueia.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 4 → TP · PR01-03

> O código permite que o cliente envie explicitamente um valor para availableCopies no payload da requisição, o que sobrescreve a regra padrão de igualar as cópias disponíveis às cópias totais no momento do cadastro.

**Por quê:** Aponta a causa (availableCopies vindo da entrada, linha citada) e o efeito (disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R13

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R13.md)

*Observação:* O parágrafo final comenta a combinação dos achados 1 e 3; não é achado separado.

### R13 · Achado 1 → TP · PR01-02

> o livro é salvo no repositório antes de qualquer validação de campos. Quando a validação falha, o erro é lançado, mas o registro inválido já foi inserido no acervo e não há rollback.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (livro inválido aparece em GET /books).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 2 → TP · PR01-01

> o critério de busca combina isbn e title, então a duplicidade só é detectada quando ambos coincidem. Dois livros com o mesmo ISBN e títulos diferentes passam na checagem.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 3 → TP · PR01-03

> a quantidade disponível é derivada do corpo da requisição quando informada, em vez de ser sempre igual à quantidade total. Isso também permite valores negativos ou maiores que totalCopies.

**Por quê:** Aponta a causa (availableCopies vindo da entrada) e o efeito (disponível fora do esperado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 4 → TP · PR01-04

> a checagem só rejeita valores falsy (0, undefined, null, ""). Números negativos e valores não numéricos (como a string "3") são aceitos.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R14

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R14.md)

*Observação:* O parágrafo final reforça a gravidade do achado 2; não é achado separado.

### R14 · Achado 1 → TP · PR01-01

> A verificação de unicidade considera simultaneamente ISBN e título. Assim, um ISBN já cadastrado pode ser reutilizado se o novo livro tiver outro título.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 2 → TP · PR01-02

> O livro é persistido antes de validar ISBN, título, autor e quantidade. Quando uma validação falha, a exceção é lançada depois de o acervo já ter sido alterado.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (livro inválido permanece no acervo).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 3 → TP · PR01-04

> A validação não garante que a quantidade total seja maior que zero. (...) Valores negativos são truthy em JavaScript e passam pela validação. Ex.: totalCopies: -1 resulta em cadastro aceito.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 4 → TP · PR01-03

> O cliente consegue definir a quantidade disponível no cadastro, apesar de um novo livro dever iniciar sempre com disponibilidade igual à quantidade total.

**Por quê:** Aponta a causa (availableCopies vindo da entrada, linha citada) e o efeito (disponível diferente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R15

**Encontrou 4 de 4 (PR01-01, PR01-02, PR01-03, PR01-04) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R15.md)

### R15 · Achado 1 → TP · PR01-01

> A busca por um livro existente está combinando os campos isbn e title. (...) O sistema permite cadastrar dois livros com o mesmo ISBN (duplicidade), desde que os títulos enviados sejam diferentes.

**Por quê:** Aponta a causa (busca por isbn + title) e o efeito (ISBN duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 2 → TP · PR01-02

> As checagens de campos obrigatórios (isBlank) e quantidade ocorrem depois que a operação de salvamento no repositório já foi executada.

**Por quê:** Aponta a causa (save antes das validações) e o efeito (livro inválido armazenado e depois o erro é lançado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 3 → TP · PR01-04

> A validação !totalCopies verifica apenas se o valor é falsy (zero, null ou undefined), falhando em capturar números negativos.

**Por quê:** Aponta a causa (truthiness) e o efeito (negativo aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 4 → TP · PR01-03

> O sistema permite que o atributo availableCopies seja definido a partir da entrada do usuário (input).

**Por quê:** Aponta a causa (availableCopies vindo da entrada, linha citada) e o efeito (disponível divergente do total).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 
