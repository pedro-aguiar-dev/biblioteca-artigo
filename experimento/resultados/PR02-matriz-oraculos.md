# Matriz de independência — PR02

Gerado em 2026-10-02T18:57:05.937Z · arquivos variados: src/users/user.service.js

| Variante | Oráculo PR02-02 | Oráculo PR02-03 | Oráculo PR02-04 | Oráculo PR02-05 |
|---|---|---|---|---|
| baseline | passa | passa | passa | passa |
| só PR02-02 | FALHA | passa | passa | passa |
| só PR02-03 | passa | FALHA | passa | passa |
| só PR02-04 | passa | passa | FALHA | passa |
| só PR02-05 | passa | passa | passa | FALHA |
| experimental (todos) | FALHA | FALHA | FALHA | FALHA |

Resultado: **conforme** — cada oráculo falha somente com o seu defeito; a baseline passa em todos; a versão experimental falha em todos.
