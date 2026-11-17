# Matriz de independência — PR05

Gerado em 2026-10-09T20:30:02.062Z · arquivos variados: src/loans/loan.service.js

| Variante | Oráculo PR05-01 | Oráculo PR05-02 | Oráculo PR05-03 | Oráculo PR05-05 |
|---|---|---|---|---|
| baseline | passa | passa | passa | passa |
| só PR05-01 | FALHA | passa | passa | passa |
| só PR05-02 | passa | FALHA | passa | passa |
| só PR05-03 | passa | passa | FALHA | passa |
| só PR05-05 | passa | passa | passa | FALHA |
| experimental (todos) | FALHA | FALHA | FALHA | FALHA |

Resultado: **conforme** — cada oráculo falha somente com o seu defeito; a baseline passa em todos; a versão experimental falha em todos.
