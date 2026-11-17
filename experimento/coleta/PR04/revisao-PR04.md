# Revisão da classificação — PR04 Realização de empréstimos (RF04)

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

## Gabarito do PR04

| Defeito | O que é, em uma frase | Onde |
|---|---|---|
| **PR04-01** — Estoque decrementado antes de concluir todas as validações | A disponibilidade é reduzida logo após a checagem de estoque, antes das validações de limite, atraso e duplicidade. | `src/loans/loan.service.js` — LoanService.createLoan (linha 42) e persistLoan (linhas 75–83) |
| **PR04-02** — Limite calculado incluindo empréstimos já devolvidos | A validação do limite conta todo o histórico do usuário. | `src/loans/loan.service.js` — LoanService.createLoan (linhas 44–49) |
| **PR04-03** — Livro que vence hoje é tratado como atrasado | A comparação de atraso inclui a igualdade. | `src/loans/loan.service.js` — LoanService.createLoan (linha 51) |
| **PR04-04** — Histórico do mesmo livro impede novo empréstimo | A checagem de duplicidade considera também empréstimos devolvidos. | `src/loans/loan.service.js` — LoanService.createLoan (linhas 55–60) |
| **PR04-05** — Uso do relógio da máquina em vez da data controlada da operação | O vencimento é calculado a partir de new Date(), ignorando currentDate. | `src/loans/loan.service.js` — LoanService.createLoan (linha 67) |

## Visão geral

| Resposta | PR04-01 | PR04-02 | PR04-03 | PR04-04 | PR04-05 | FP | Desconsiderados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| [R01](#r01) | ✓ | ✓ | ✓ | ✓ | ✓ | 1 | 0 |
| [R02](#r02) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R03](#r03) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R04](#r04) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R05](#r05) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R06](#r06) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R07](#r07) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R08](#r08) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R09](#r09) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R10](#r10) | ✓ | ✓ | ✓ | ✓ | ✓ | 1 | 0 |
| [R11](#r11) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R12](#r12) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R13](#r13) | ✓ | ✓ | ✓ | ✓ | ✓ | 1 | 0 |
| [R14](#r14) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R15](#r15) | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 |

✓ = encontrou · ✓ parcial = encontrou o comportamento, causa errada/ausente · — = não encontrou

## Pontos que pedem sua atenção

São os únicos casos que envolveram julgamento. O restante dos achados corresponde diretamente ao gabarito.

**Classificações fora de TP (FP, desconsiderado, parcial, não planejado):**

- [R01](#r01) · achado 6 → **FP** — A PR04 define currentDate como entrada da operação para tornar a data controlável e determinística. O requisito proíbe dependência direta do relógio da máquina, mas não exige que o servidor ignore a data informada nem uma abstração injetável. A alegação trata a interface especificada como defeito.
- [R10](#r10) · achado 6 → **FP** — A PR04 define currentDate como entrada da operação para tornar a data controlável e determinística. O requisito proíbe dependência direta do relógio da máquina, mas não exige que o servidor ignore a data informada nem uma abstração injetável. A alegação trata a interface especificada como defeito.
- [R13](#r13) · achado 6 → **FP** — A PR04 define currentDate como entrada da operação para tornar a data controlável e determinística. O requisito proíbe dependência direta do relógio da máquina, mas não exige que o servidor ignore a data informada nem uma abstração injetável. A alegação trata a interface especificada como defeito.

**Achados consolidados (repetem a causa de outro achado da mesma resposta):**

- Nenhum.

**Trechos das respostas que não foram contados como achado:**

- [R09](#r09) — A alegação adicional sobre rollback/snapshot foi consolidada com PR04-01, pois descreve outra manifestação da mesma causa raiz: o decremento ocorre antes da transação.
- [R12](#r12) — A alegação adicional sobre rollback/snapshot foi consolidada com PR04-01, pois descreve outra manifestação da mesma causa raiz: o decremento ocorre antes da transação.
- [R14](#r14) — A observação sobre métodos externos ao diff foi explicitamente marcada como não confirmada e não é contada como achado.
- [R15](#r15) — A alegação adicional sobre rollback/snapshot foi consolidada com PR04-01, pois descreve outra manifestação da mesma causa raiz: o decremento ocorre antes da transação.

---

## R01

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 1 · Desconsiderados: 0** · [resposta completa](cegas/R01.md)

### R01 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 6 → FP

> A data da operação fornecida pelo cliente deveria vir de um relógio injetável; currentDate permitiria contornar as regras temporais.

**Por quê:** A PR04 define currentDate como entrada da operação para tornar a data controlável e determinística. O requisito proíbe dependência direta do relógio da máquina, mas não exige que o servidor ignore a data informada nem uma abstração injetável. A alegação trata a interface especificada como defeito.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R02

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R02.md)

### R02 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R03

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R03.md)

### R03 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R04

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R04.md)

### R04 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R05

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R05.md)

### R05 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R06

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R06.md)

### R06 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R07

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R07.md)

### R07 · Achado 1 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 2 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 3 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 4 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 5 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R08

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R08.md)

### R08 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R09

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R09.md)

*Observação:* A alegação adicional sobre rollback/snapshot foi consolidada com PR04-01, pois descreve outra manifestação da mesma causa raiz: o decremento ocorre antes da transação.

### R09 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R10

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 1 · Desconsiderados: 0** · [resposta completa](cegas/R10.md)

### R10 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 6 → FP

> A data da operação fornecida pelo cliente deveria vir de um relógio injetável; currentDate permitiria contornar as regras temporais.

**Por quê:** A PR04 define currentDate como entrada da operação para tornar a data controlável e determinística. O requisito proíbe dependência direta do relógio da máquina, mas não exige que o servidor ignore a data informada nem uma abstração injetável. A alegação trata a interface especificada como defeito.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R11

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R11.md)

### R11 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R12

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R12.md)

*Observação:* A alegação adicional sobre rollback/snapshot foi consolidada com PR04-01, pois descreve outra manifestação da mesma causa raiz: o decremento ocorre antes da transação.

### R12 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R13

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 1 · Desconsiderados: 0** · [resposta completa](cegas/R13.md)

### R13 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 6 → FP

> A data da operação fornecida pelo cliente deveria vir de um relógio injetável; currentDate permitiria contornar as regras temporais.

**Por quê:** A PR04 define currentDate como entrada da operação para tornar a data controlável e determinística. O requisito proíbe dependência direta do relógio da máquina, mas não exige que o servidor ignore a data informada nem uma abstração injetável. A alegação trata a interface especificada como defeito.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R14

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R14.md)

*Observação:* A observação sobre métodos externos ao diff foi explicitamente marcada como não confirmada e não é contada como achado.

### R14 · Achado 1 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 5 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R15

**Encontrou 5 de 5 (PR04-01, PR04-02, PR04-03, PR04-04, PR04-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R15.md)

*Observação:* A alegação adicional sobre rollback/snapshot foi consolidada com PR04-01, pois descreve outra manifestação da mesma causa raiz: o decremento ocorre antes da transação.

### R15 · Achado 1 → TP · PR04-05

> A data prevista usa new Date() em vez de currentDate.

**Por quê:** A resposta identifica a dependência do relógio da máquina e o vencimento calculado a partir da data errada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 2 → TP · PR04-02

> O limite usa o histórico completo e inclui empréstimos já devolvidos.

**Por quê:** A resposta identifica findByUser no lugar da consulta de empréstimos abertos e a rejeição indevida.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 3 → TP · PR04-03

> A comparação <= considera atrasado o empréstimo que vence na data da operação.

**Por quê:** A resposta identifica a condição de fronteira e informa corretamente que a comparação deve ser estrita.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 4 → TP · PR04-04

> A consulta de duplicidade considera empréstimos devolvidos do mesmo livro.

**Por quê:** A resposta identifica findByUserAndBook no lugar da consulta restrita aos empréstimos abertos.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 5 → TP · PR04-01

> Estoque decrementado antes de todas as validações; uma rejeição posterior pode deixar availableCopies reduzido.

**Por quê:** A resposta localiza a mutação antecipada, descreve a rejeição posterior e o efeito persistente no estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 
