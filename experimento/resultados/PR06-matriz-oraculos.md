# Matriz de independência — PR06

Gerado em 2026-10-09T21:11:08.097Z · arquivos variados: src/loans/loan.service.js

| Variante | Oráculo PR06-01 | Oráculo PR06-02 | Oráculo PR06-03 | Oráculo PR06-05 |
|---|---|---|---|---|
| baseline | passa | passa | passa | passa |
| só PR06-01 | FALHA | passa | passa | passa |
| só PR06-02 | passa | FALHA | passa | passa |
| só PR06-03 | passa | passa | FALHA | passa |
| só PR06-05 | passa | passa | passa | FALHA |
| experimental (todos) | FALHA | FALHA | FALHA | FALHA |

Resultado: **conforme** — cada oráculo falha somente com o seu defeito; a baseline passa em todos; a versão experimental falha em todos.
