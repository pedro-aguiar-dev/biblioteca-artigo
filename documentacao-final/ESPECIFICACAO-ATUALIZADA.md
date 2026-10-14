# Especificação atualizada do Sistema de Biblioteca

**Versão 2.0 — estado implementado e validado em 14 de outubro de 2026**

## 1. Objetivo e escopo

Esta especificação atualiza o documento versão 1.0 fornecido no início do projeto. Ela descreve a API backend efetivamente construída para o experimento de avaliação de LLMs. O sistema gerencia livros, usuários e empréstimos; oferece cadastro, consulta, empréstimo, devolução e renovação; e mantém seus dados em memória.

## 2. Tecnologia e arquitetura

- JavaScript em Node.js 24 ou superior, módulos ES.
- Express 5.2.1.
- Camadas de rota, serviço e repositório.
- Persistência em memória, sem banco ou serviço externo.
- Datas civis ISO `YYYY-MM-DD`, interpretadas em UTC.
- Erros em JSON no formato `{"error":"CODIGO"}`.

## 3. Modelo de dados

### Livro

| Campo | Tipo | Regra |
|---|---|---|
| id | inteiro | gerado, positivo e sequencial |
| isbn | texto | obrigatório, não vazio e único por comparação exata |
| title | texto | obrigatório e não vazio |
| author | texto | obrigatório e não vazio |
| totalCopies | inteiro | maior que zero |
| availableCopies | inteiro | inicializado com totalCopies; controlado pelo sistema |

### Usuário

| Campo | Tipo | Regra |
|---|---|---|
| id | inteiro | gerado, positivo e sequencial |
| name | texto | obrigatório e não vazio |
| email | texto | formato simples algo@dominio.ext e unicidade exata |

### Empréstimo

| Campo | Tipo | Regra |
|---|---|---|
| id | inteiro | gerado, positivo e sequencial |
| userId, bookId | inteiro | referências existentes |
| loanDate | data | data da operação |
| dueDate | data | loanDate + 14 dias; depois prorrogável |
| returnDate | data ou null | null enquanto aberto |
| renewalCount | inteiro | inicia em zero; máximo três |

## 4. Requisitos funcionais atualizados

### RF01 — cadastrar livro

O sistema deve aceitar ISBN, título, autor e quantidade total; validar campos; rejeitar ISBN existente; ignorar tentativa do cliente de definir disponibilidade; criar disponibilidade igual ao total; e não alterar o acervo em caso de rejeição. Rotas: `POST /books` e listagem auxiliar `GET /books`.

### RF02 — cadastrar usuário

O sistema deve aceitar nome e e-mail válidos, rejeitar e-mail duplicado e preservar os dados em falhas. Rotas: `POST /users` e listagem auxiliar paginada `GET /users?page=&size=`, com página padrão 0, tamanho padrão 20 e máximo 100.

### RF03 — consultar acervo

`GET /books/search?q=termo` deve pesquisar título ou autor, sem diferenciar caixa, com correspondência em qualquer posição, união dos dois campos, sem duplicar livros e sem limite artificial. Termo ausente ou em branco gera `INVALID_SEARCH_TERM`.

### RF04 — realizar empréstimo

`POST /loans` recebe `userId`, `bookId` e `currentDate`. Deve validar entidades, estoque, limite de três empréstimos abertos, atraso e duplicidade aberta do mesmo livro. Ao aceitar, cria prazo de 14 dias e reduz o estoque em uma unidade de forma atômica.

### RF05 — registrar devolução

`POST /loans/:id/return` recebe `currentDate`. Deve aceitar devolução atrasada, rejeitar empréstimo ausente ou já devolvido, gravar a data e incrementar exatamente uma unidade de estoque na mesma transação.

### RF06 — renovar empréstimo

`POST /loans/:id/renew` recebe `currentDate`. Deve rejeitar empréstimo inexistente, devolvido, atrasado ou já renovado três vezes. Cada renovação soma sete dias ao vencimento vigente, incrementa o contador e não altera estoque.

### RF07 — atualizar e-mail do usuário (requisito acrescentado)

`PATCH /users/:id/email` deve validar o novo e-mail, garantir unicidade entre outros usuários, permitir manter o próprio e-mail, rejeitar usuário inexistente e preservar o estado em falhas.

## 5. Regras de negócio consolidadas

- RN01: prazo inicial de 14 dias corridos.
- RN02: renovação acrescenta 7 dias ao vencimento vigente.
- RN03: máximo de 3 renovações.
- RN04: máximo de 3 empréstimos em aberto por usuário.
- RN05: um usuário não pode possuir dois empréstimos abertos do mesmo livro.
- RN06: empréstimo exige ao menos um exemplar disponível.
- RN07: atraso existe somente quando `dueDate < currentDate`; igualdade não é atraso.
- RN08: operação rejeitada não modifica dados; atualizações correlatas são atômicas.
- RN09: a disponibilidade nunca fica negativa e cada empréstimo/devolução altera uma unidade.

## 6. Contrato de erros

| Código | Status | Situação |
|---|---:|---|
| INVALID_JSON | 400 | JSON malformado |
| INVALID_BOOK / INVALID_QUANTITY | 400 | cadastro de livro inválido |
| ISBN_ALREADY_EXISTS | 409 | ISBN duplicado |
| INVALID_USER / INVALID_EMAIL | 400 | usuário ou e-mail inválido |
| EMAIL_ALREADY_EXISTS | 409 | e-mail duplicado |
| USER_NOT_FOUND | 404 | usuário inexistente |
| INVALID_PAGINATION | 400 | página ou tamanho inválido |
| INVALID_SEARCH_TERM | 400 | pesquisa vazia |
| INVALID_LOAN / INVALID_RETURN / INVALID_RENEWAL | 400 | entrada de operação inválida |
| BOOK_NOT_FOUND / LOAN_NOT_FOUND | 404 | entidade inexistente |
| BOOK_UNAVAILABLE | 409 | sem exemplar disponível |
| LOAN_LIMIT_REACHED | 409 | três empréstimos abertos |
| OVERDUE_LOAN | 409 | atraso bloqueia empréstimo ou renovação |
| BOOK_ALREADY_BORROWED | 409 | duplicidade aberta |
| LOAN_ALREADY_RETURNED | 409 | devolução/renovação após devolução |
| RENEWAL_LIMIT_REACHED | 409 | quarta renovação |
| INTERNAL_ERROR | 500 | erro não tratado |

## 7. Critérios de qualidade e aceite

O sistema deve ser determinístico, testável sem serviços externos, preservar integridade em operações rejeitadas e emitir erros identificáveis. A versão final foi aceita com 112/112 testes automatizados e roteiros HTTP PR01 10/10, PR02 15/15, PR03 8/8, PR04 10/10, PR05 6/6 e PR06 7/7. O código de referência é o commit `a9ea606`, tag `pr06-corrigido`.

## 8. Mudanças frente à versão 1.0

Foram formalizados RF07, endpoints auxiliares de listagem, formato de e-mail, paginação, contratos HTTP, códigos de erro, formato UTC de datas e atomicidade em memória. Foi também corrigida a descrição experimental: o estudo usou 25 defeitos em seis PRs, e não um único defeito por PR.
