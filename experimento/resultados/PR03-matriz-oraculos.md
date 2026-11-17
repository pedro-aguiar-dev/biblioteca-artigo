# Matriz de independência — PR03

Gerado em 2026-10-06T19:01:51.441Z · arquivos variados: src/books/book.repository.js, src/books/book.service.js

| Variante | Oráculo PR03-01 | Oráculo PR03-03 | Oráculo PR03-04 | Oráculo PR03-06 |
|---|---|---|---|---|
| baseline | passa | passa | passa | passa |
| só PR03-01 | FALHA | passa | passa | passa |
| só PR03-03 | passa | FALHA | passa | passa |
| só PR03-04 | passa | passa | FALHA | passa |
| só PR03-06 | passa | passa | passa | FALHA |
| experimental (todos) | FALHA | FALHA | FALHA | FALHA |

Resultado: **conforme** — cada oráculo falha somente com o seu defeito; a baseline passa em todos; a versão experimental falha em todos.
