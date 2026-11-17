# Revisão da classificação — PR03 Consulta ao acervo (RF03)

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

## Gabarito do PR03

| Defeito | O que é, em uma frase | Onde |
|---|---|---|
| **PR03-01** — Apenas o termo pesquisado é normalizado para minúsculas | O termo vai para minúsculas, mas título e autor são comparados com a capitalização original. | `src/books/book.repository.js` — função matchesTerm (linhas 44–47; comparação na linha 46) |
| **PR03-03** — Autor é pesquisado somente se nenhum título for encontrado | A busca por autor só roda quando nenhum título corresponde; livros compatíveis só pelo autor ficam de fora. | `src/books/book.service.js e src/books/book.repository.js` — BookService.searchBooks (linhas 43–44) e BookRepository.searchByTitle / searchByAuthor (linhas 19–25) |
| **PR03-04** — Correspondência parcial implementada apenas como prefixo | A comparação usa startsWith: só encontra textos que começam pelo termo. | `src/books/book.repository.js` — função matchesTerm (linhas 44–47; comparação na linha 46) |
| **PR03-06** — Resultados limitados a uma quantidade fixa (substituto do PR03-05) | A busca devolve só os 10 primeiros livros compatíveis. | `src/books/book.service.js` — constante MAX_SEARCH_RESULTS (linha 3) e BookService.searchBooks (linha 46) |

## Visão geral

| Resposta | PR03-01 | PR03-03 | PR03-04 | PR03-06 | FP | Desconsiderados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| [R01](#r01) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
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

- Nenhuma.

**Achados consolidados (repetem a causa de outro achado da mesma resposta):**

- Nenhum.

**Trechos das respostas que não foram contados como achado:**

- [R04](#r04) — O ponto adicional sobre `q` ausente ou repetido foi apresentado como possível e não confirmado; não é contado como achado.
- [R07](#r07) — A observação sobre `q` ausente e `isBlank` foi explicitamente marcada como não confirmada; não é contada como achado.
- [R08](#r08) — A seção “Verificações sem defeito” não contém achados.
- [R12](#r12) — A seção “Observações adicionais” marca os pontos sobre termo ausente ou não textual como não classificados; não são contados como achados.
- [R13](#r13) — As seções “Pontos verificados sem defeito” e “Observação (a confirmar)” não contêm achados confirmados.

---

## R01

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R01.md)

### R01 · Achado 1 → TP · PR03-04

> A busca usa `startsWith`, portanto só encontra termos no início do título/autor.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 2 → TP · PR03-01

> Apenas o termo pesquisado é convertido para minúsculas. O título/autor do livro não é normalizado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 3 → TP · PR03-03

> A pesquisa por autor só é executada quando nenhum livro foi encontrado pelo título.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 4 → TP · PR03-06

> O serviço limita arbitrariamente o resultado a 10 livros.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R02

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R02.md)

### R02 · Achado 1 → TP · PR03-01

> converte apenas o termo pesquisado (`term`) para letras minúsculas, mas não faz a conversão do campo original da base (`text`)

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 2 → TP · PR03-04

> utiliza o método `startsWith()`, que só valida se o termo pesquisado está localizado estritamente no início da string

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 3 → TP · PR03-03

> A lógica da busca por autor está condicionada à falha da busca por título

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 4 → TP · PR03-06

> Há uma constante `MAX_SEARCH_RESULTS = 10` sendo utilizada para truncar o retorno

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R03

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R03.md)

### R03 · Achado 1 → TP · PR03-01

> converte apenas o termo de pesquisa (`term`) para letras minúsculas, mas não faz o mesmo com o texto do livro (`text`)

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 2 → TP · PR03-04

> utiliza o método `startsWith()`, o que restringe a correspondência apenas ao início do texto

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 3 → TP · PR03-03

> a pesquisa por autor só seja executada caso a pesquisa por título não retorne nenhum resultado

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 4 → TP · PR03-06

> limita a quantidade de resultados retornados a um máximo de 10 itens

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R04

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R04.md)

*Observação:* O ponto adicional sobre `q` ausente ou repetido foi apresentado como possível e não confirmado; não é contado como achado.

### R04 · Achado 1 → TP · PR03-04

> A comparação usa `startsWith`, então só encontra livros cujo título/autor começa com o termo.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 2 → TP · PR03-01

> Apenas o termo (`term`) é convertido para minúsculas; o texto do livro (`text`) não é normalizado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 3 → TP · PR03-03

> A busca por autor só ocorre quando a busca por título retorna vazio.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 4 → TP · PR03-06

> O resultado é truncado em 10 itens, sem respaldo em nenhum requisito.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R05

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R05.md)

### R05 · Achado 1 → TP · PR03-04

> A busca parcial foi implementada apenas como correspondência de prefixo.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 2 → TP · PR03-01

> Apenas o termo pesquisado é convertido para minúsculas; o texto do livro não é normalizado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 3 → TP · PR03-03

> A pesquisa por autor só é executada quando nenhum livro corresponde pelo título.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 4 → TP · PR03-06

> Foi imposto um limite de 10 resultados que não existe nos requisitos.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R06

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R06.md)

### R06 · Achado 1 → TP · PR03-04

> A busca usa `startsWith()`, portanto só considera correspondência parcial quando o termo aparece no início do título ou autor.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 2 → TP · PR03-01

> Apenas o termo pesquisado é convertido para minúsculas; o texto do livro não é normalizado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 3 → TP · PR03-03

> A busca por autor só é executada quando nenhum resultado por título é encontrado.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 4 → TP · PR03-06

> O resultado é limitado artificialmente a 10 livros.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R07

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R07.md)

*Observação:* A observação sobre `q` ausente e `isBlank` foi explicitamente marcada como não confirmada; não é contada como achado.

### R07 · Achado 1 → TP · PR03-04

> A comparação usa `startsWith`, que só encontra textos que começam com o termo.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 2 → TP · PR03-01

> Apenas o termo da pesquisa (`term`) é convertido para minúsculas. O texto do livro (`text`) é comparado sem normalização.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 3 → TP · PR03-03

> O código usa a busca por autor apenas como fallback quando não há resultados por título.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 4 → TP · PR03-06

> O resultado é truncado em 10 itens, sem que exista qualquer requisito de paginação ou limite.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R08

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R08.md)

*Observação:* A seção “Verificações sem defeito” não contém achados.

### R08 · Achado 1 → TP · PR03-04

> A comparação usa `startsWith`, então só encontra livros cujo título ou autor começa com o termo digitado.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 2 → TP · PR03-01

> O termo de busca é convertido para minúsculas, mas `text` é comparado como está armazenado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 3 → TP · PR03-03

> A busca por autor funciona como fallback. Se existir qualquer correspondência por título, os livros cujo autor corresponde ao termo são descartados.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 4 → TP · PR03-06

> O resultado é truncado em 10 livros, limite que não existe nos requisitos.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R09

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R09.md)

### R09 · Achado 1 → TP · PR03-04

> A função utiliza `text.startsWith(query)`, o que aceita correspondência apenas se o texto começar com o termo pesquisado.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 2 → TP · PR03-01

> O termo de busca é convertido para letras minúsculas, porém a propriedade do livro permanece no formato original durante a comparação.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 3 → TP · PR03-03

> O código executa a busca por autor de forma mutuamente exclusiva com a busca por título.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 4 → TP · PR03-06

> O retorno da busca é limitado aos primeiros 10 itens.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R10

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R10.md)

### R10 · Achado 1 → TP · PR03-04

> A função utiliza o método `startsWith` para verificar a correspondência.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 2 → TP · PR03-01

> O parâmetro `term` é convertido para minúsculas, mas o texto armazenado no livro não é convertido antes da comparação.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 3 → TP · PR03-03

> Se o termo encontrar resultados compatíveis no título, o sistema ignora completamente a busca por autor.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 4 → TP · PR03-06

> A constante `MAX_SEARCH_RESULTS` em conjunto com `.slice` trunca arbitrariamente o retorno.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R11

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R11.md)

### R11 · Achado 1 → TP · PR03-01

> Apenas o termo pesquisado (`term`) é convertido para minúsculas. O texto original do livro (`text`) não é convertido.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 2 → TP · PR03-04

> O código utiliza o método `text.startsWith(query)`, que avalia apenas se o título/autor começa com o termo pesquisado.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 3 → TP · PR03-03

> A busca por autor é completamente ignorada se a busca por título retornar algum resultado.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 4 → TP · PR03-06

> O retorno está fatiando a lista com `slice`, limitando os resultados a no máximo 10 livros.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R12

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R12.md)

*Observação:* A seção “Observações adicionais” marca os pontos sobre termo ausente ou não textual como não classificados; não são contados como achados.

### R12 · Achado 1 → TP · PR03-04

> A comparação usa `startsWith`, então só encontra textos que começam com o termo pesquisado.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 2 → TP · PR03-01

> Apenas o termo da pesquisa é convertido para minúsculas. O texto do livro é comparado como está armazenado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 3 → TP · PR03-03

> Os resultados por autor só são consultados quando não há nenhum resultado por título.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 4 → TP · PR03-06

> O resultado é truncado em 10 itens, sem previsão nos requisitos.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R13

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R13.md)

*Observação:* As seções “Pontos verificados sem defeito” e “Observação (a confirmar)” não contêm achados confirmados.

### R13 · Achado 1 → TP · PR03-04

> a comparação usa `startsWith`, o que só encontra termos no início do texto

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 2 → TP · PR03-01

> apenas o termo pesquisado é convertido para minúsculas; o texto do livro não é normalizado

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 3 → TP · PR03-03

> os resultados por autor são descartados sempre que existir pelo menos um resultado por título

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 4 → TP · PR03-06

> o resultado é truncado em 10 itens, sem previsão nos requisitos

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R14

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R14.md)

### R14 · Achado 1 → TP · PR03-04

> A busca usa `startsWith()`, aceitando correspondência apenas no início do título/autor.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 2 → TP · PR03-01

> Apenas o termo é convertido para minúsculas; o texto do livro não é normalizado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 3 → TP · PR03-03

> A pesquisa por autor só ocorre quando nenhum resultado por título foi encontrado.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 4 → TP · PR03-06

> O resultado é artificialmente limitado a 10 itens.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R15

**Encontrou 4 de 4 (PR03-01, PR03-03, PR03-04, PR03-06) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R15.md)

### R15 · Achado 1 → TP · PR03-04

> A busca usa `startsWith`, portanto só encontra o termo quando ele aparece no início do título/autor.

**Por quê:** Aponta a causa (`startsWith` em vez de `includes`) e o efeito (termos no meio ou no fim não são encontrados).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 2 → TP · PR03-01

> Apenas o termo pesquisado é convertido para minúsculas; o texto do livro não é normalizado.

**Por quê:** Aponta a causa (somente o termo é normalizado) e o efeito (comparação continua sensível a maiúsculas e minúsculas).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 3 → TP · PR03-03

> A pesquisa por autor só é executada quando nenhum resultado por título é encontrado.

**Por quê:** Aponta a causa (autor usado apenas como fallback da busca por título) e o efeito (resultados compatíveis por autor são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 4 → TP · PR03-06

> O resultado é limitado artificialmente a 10 livros.

**Por quê:** Aponta a causa (limite 10 aplicado com `slice`) e o efeito (livros compatíveis após o décimo são omitidos).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 
