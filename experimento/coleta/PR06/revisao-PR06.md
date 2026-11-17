# Revisão da classificação — PR06 Renovação de empréstimos (RF06)

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

## Gabarito do PR06

| Defeito | O que é, em uma frase | Onde |
|---|---|---|
| **PR06-01** — Renovação calculada a partir da data atual | undefined | `src/loans/loan.service.js` — undefined |
| **PR06-02** — Vencimento modificado antes de validar o limite | undefined | `src/loans/loan.service.js` — undefined |
| **PR06-03** — Empréstimo que vence hoje é considerado atrasado | undefined | `src/loans/loan.service.js` — undefined |
| **PR06-05** — Helper compartilhado altera estoque durante renovação | undefined | `src/loans/loan.service.js` — undefined |

## Visão geral

| Resposta | PR06-01 | PR06-02 | PR06-03 | PR06-05 | FP | Desconsiderados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| [R01](#r01) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R02](#r02) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R03](#r03) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R04](#r04) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R05](#r05) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R06](#r06) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R07](#r07) | ✓ | — | ✓ | ✓ | 0 | 0 |
| [R08](#r08) | ✓ | — | ✓ | ✓ | 0 | 0 |
| [R09](#r09) | ✓ | — | ✓ | ✓ | 0 | 0 |
| [R10](#r10) | ✓ | — | ✓ | ✓ | 0 | 0 |
| [R11](#r11) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R12](#r12) | ✓ | — | ✓ | ✓ | 0 | 0 |
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

- Nenhum.

---

## R01

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R01.md)

### R01 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 3 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R02

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R02.md)

### R02 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 3 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 4 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R03

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R03.md)

### R03 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 2 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 3 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R04

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R04.md)

### R04 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 3 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R05

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R05.md)

### R05 · Achado 1 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 2 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 3 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R06

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R06.md)

### R06 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 3 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R07

**Encontrou 3 de 4 (PR06-01, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR06-02** · [resposta completa](cegas/R07.md)

### R07 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 3 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R08

**Encontrou 3 de 4 (PR06-01, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR06-02** · [resposta completa](cegas/R08.md)

### R08 · Achado 1 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 2 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 3 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R09

**Encontrou 3 de 4 (PR06-01, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR06-02** · [resposta completa](cegas/R09.md)

### R09 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 3 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R10

**Encontrou 3 de 4 (PR06-01, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR06-02** · [resposta completa](cegas/R10.md)

### R10 · Achado 1 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 2 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 3 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R11

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R11.md)

### R11 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 3 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R12

**Encontrou 3 de 4 (PR06-01, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0 · Não encontrou: PR06-02** · [resposta completa](cegas/R12.md)

### R12 · Achado 1 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 2 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 3 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R13

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R13.md)

### R13 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 3 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R14

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R14.md)

### R14 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 2 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 3 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R15

**Encontrou 4 de 4 (PR06-01, PR06-02, PR06-03, PR06-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R15.md)

### R15 · Achado 1 → TP · PR06-01

> A renovação soma sete dias a currentDate, não ao vencimento atual.

**Por quê:** Identifica a base temporal errada e a perda de dias restantes.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 2 → TP · PR06-02

> dueDate é alterado antes de verificar o limite de três renovações.

**Por quê:** Identifica a mutação antecipada e o estado alterado na quarta tentativa rejeitada.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 3 → TP · PR06-03

> A comparação <= bloqueia a renovação no próprio dia do vencimento.

**Por quê:** Identifica a condição de fronteira e a comparação estrita exigida por RN07.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 4 → TP · PR06-05

> renewLoan chama persistLoan, que decrementa availableCopies.

**Por quê:** Acompanha o helper e identifica o efeito indireto proibido sobre o estoque.

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 
