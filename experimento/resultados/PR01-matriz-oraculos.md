# Matriz de independência — PR01

Gerado em 2026-10-01T17:54:31.577Z · arquivos variados: src/books/book.service.js

| Variante | Oráculo PR01-01 | Oráculo PR01-02 | Oráculo PR01-03 | Oráculo PR01-04 |
|---|---|---|---|---|
| baseline | passa | passa | passa | passa |
| só PR01-01 | FALHA | passa | passa | passa |
| só PR01-02 | passa | FALHA | passa | passa |
| só PR01-03 | passa | passa | FALHA | passa |
| só PR01-04 | passa | passa | passa | FALHA |
| experimental (todos) | FALHA | FALHA | FALHA | FALHA |

Resultado: **conforme** — cada oráculo falha somente com o seu defeito; a baseline passa em todos; a versão experimental falha em todos.
