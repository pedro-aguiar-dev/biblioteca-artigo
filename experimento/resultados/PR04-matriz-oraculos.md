# Matriz de independência — PR04

Gerado em 2026-10-08T16:22:07.745Z · arquivos variados: src/loans/loan.service.js

| Variante | Oráculo PR04-01 | Oráculo PR04-02 | Oráculo PR04-03 | Oráculo PR04-04 | Oráculo PR04-05 |
|---|---|---|---|---|---|
| baseline | passa | passa | passa | passa | passa |
| só PR04-01 | FALHA | passa | passa | passa | passa |
| só PR04-02 | passa | FALHA | passa | passa | passa |
| só PR04-03 | passa | passa | FALHA | passa | passa |
| só PR04-04 | passa | passa | passa | FALHA | passa |
| só PR04-05 | passa | passa | passa | passa | FALHA |
| experimental (todos) | FALHA | FALHA | FALHA | FALHA | FALHA |

Resultado: **conforme** — cada oráculo falha somente com o seu defeito; a baseline passa em todos; a versão experimental falha em todos.
