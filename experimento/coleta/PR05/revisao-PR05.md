# Revisão da classificação — PR05 Realização de devoluções (RF05)

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

## Gabarito do PR05

| Defeito | O que é, em uma frase | Onde |
|---|---|---|
| **PR05-01** — Estoque incrementado antes de verificar devolução duplicada | undefined | `src/loans/loan.service.js` — undefined |
| **PR05-02** — Empréstimo atrasado não pode ser devolvido | undefined | `src/loans/loan.service.js` — undefined |
| **PR05-03** — Devolução restaura todo o estoque do livro | undefined | `src/loans/loan.service.js` — undefined |
| **PR05-05** — Atualização do empréstimo e do estoque sem atomicidade | undefined | `src/loans/loan.service.js` — undefined |

## Visão geral

| Resposta | PR05-01 | PR05-02 | PR05-03 | PR05-05 | FP | Desconsiderados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| [R01](#r01) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R02](#r02) | ✓ | ✓ | ✓ | ✓ | 1 | 0 |
| [R03](#r03) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R04](#r04) | ✓ | ✓ | ✓ | — | 0 | 0 |
| [R05](#r05) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R06](#r06) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R07](#r07) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R08](#r08) | ✓ | ✓ | ✓ | ✓ | 1 | 0 |
| [R09](#r09) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R10](#r10) | ✓ | ✓ | ✓ | — | 0 | 0 |
| [R11](#r11) | ✓ | ✓ | ✓ | — | 0 | 0 |
| [R12](#r12) | ✓ | ✓ | ✓ | — | 0 | 0 |
| [R13](#r13) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R14](#r14) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R15](#r15) | ✓ | ✓ | ✓ | — | 0 | 0 |

✓ = encontrou · ✓ parcial = encontrou o comportamento, causa errada/ausente · — = não encontrou

## Pontos que pedem sua atenção

São os únicos casos que envolveram julgamento. O restante dos achados corresponde diretamente ao gabarito.

**Classificações fora de TP (FP, desconsiderado, parcial, não planejado):**

- [R02](#r02) · achado 5 → **FP** — Os requisitos exigem registrar uma data controlada, mas não definem que a devolução deva ser igual ou posterior à data do empréstimo nem proíbem currentDate na entrada. A alegação acrescenta uma regra não especificada.
- [R08](#r08) · achado 5 → **FP** — A resposta apresenta um risco condicional a outra implementação de repositório. No sistema fornecido, o objeto compartilhado recebe returnDate antes da cessão assíncrona relevante, e o comportamento alegado não é comprovável no recorte.

**Achados consolidados (repetem a causa de outro achado da mesma resposta):**

- Nenhum.

**Trechos das respostas que não foram contados como achado:**

- Nenhum.

---

## R01

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R01.md)

### R01 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R02

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 1 · Desconsiderados: 0** · [resposta completa](cegas/R02.md)

### R02 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 5 → FP

> A data de devolução não é validada contra a data do empréstimo e currentDate vem do cliente.

**Por quê:** Os requisitos exigem registrar uma data controlada, mas não definem que a devolução deva ser igual ou posterior à data do empréstimo nem proíbem currentDate na entrada. A alegação acrescenta uma regra não especificada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R03

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R03.md)

### R03 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 2 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 3 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R04

**Encontrou 3 de 4 (PR05-01, PR05-02, PR05-03) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR05-05** · [resposta completa](cegas/R04.md)

### R04 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R05

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R05.md)

### R05 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 2 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 3 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R06

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R06.md)

### R06 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R07

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R07.md)

### R07 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 2 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 3 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R08

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 1 · Desconsiderados: 0** · [resposta completa](cegas/R08.md)

### R08 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 2 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 3 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 5 → FP

> Devoluções simultâneas podem processar o mesmo empréstimo mais de uma vez.

**Por quê:** A resposta apresenta um risco condicional a outra implementação de repositório. No sistema fornecido, o objeto compartilhado recebe returnDate antes da cessão assíncrona relevante, e o comportamento alegado não é comprovável no recorte.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R09

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R09.md)

### R09 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R10

**Encontrou 3 de 4 (PR05-01, PR05-02, PR05-03) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR05-05** · [resposta completa](cegas/R10.md)

### R10 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R11

**Encontrou 3 de 4 (PR05-01, PR05-02, PR05-03) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR05-05** · [resposta completa](cegas/R11.md)

### R11 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 2 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 3 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R12

**Encontrou 3 de 4 (PR05-01, PR05-02, PR05-03) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR05-05** · [resposta completa](cegas/R12.md)

### R12 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R13

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R13.md)

### R13 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 2 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 3 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R14

**Encontrou 4 de 4 (PR05-01, PR05-02, PR05-03, PR05-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R14.md)

### R14 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 2 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 3 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 4 → TP · PR05-05

> Empréstimo e livro são salvos separadamente, sem runInTransaction.

**Por quê:** Identifica a falta de atomicidade e o estado parcial possível quando a segunda gravação falha.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R15

**Encontrou 3 de 4 (PR05-01, PR05-02, PR05-03) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR05-05** · [resposta completa](cegas/R15.md)

### R15 · Achado 1 → TP · PR05-02

> A validação de atraso rejeita uma devolução posterior ao vencimento.

**Por quê:** Identifica o validador indevido e a violação de CA24.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 2 → TP · PR05-03

> A devolução define availableCopies como totalCopies em vez de incrementar uma unidade.

**Por quê:** Identifica a atribuição incorreta e o estoque inflado quando há outros exemplares emprestados.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 3 → TP · PR05-01

> O estoque é incrementado antes de verificar se o empréstimo já foi devolvido.

**Por quê:** Identifica a mutação antecipada e o efeito sobre uma tentativa duplicada rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 
