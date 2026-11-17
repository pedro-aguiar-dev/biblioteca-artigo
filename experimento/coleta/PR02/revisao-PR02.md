# Revisão da classificação — PR02 Cadastro de usuários (RF02) e atualização de e-mail (RF07)

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

## Gabarito do PR02

| Defeito | O que é, em uma frase | Onde |
|---|---|---|
| **PR02-02** — Regra de atualização reutilizada incorretamente na criação | No cadastro, a checagem de e-mail duplicado só rejeita se o id do usuário existente for igual ao id da entrada (que não existe na criação). | `src/users/user.service.js` — UserService.createUser — checagem de e-mail duplicado (linhas 14–18) |
| **PR02-03** — Usuário salvo antes da validação | O usuário é salvo antes de nome e e-mail serem validados: a tentativa inválida retorna erro, mas o usuário fica gravado. | `src/users/user.service.js` — UserService.createUser — save (linha 20) antes da validação (linhas 22–24) |
| **PR02-04** — Validação rejeita somente quando nome e e-mail são inválidos ao mesmo tempo | A validação usa && em vez de ||: só rejeita quando nome e e-mail são inválidos juntos. | `src/users/user.service.js` — UserService.createUser — condição de validação (linha 22) |
| **PR02-05** — Verificação de duplicidade baseada em listagem paginada | Na atualização de e-mail, a duplicidade é procurada só na primeira página de 100 usuários. | `src/users/user.service.js` — UserService.updateEmail — checagem de e-mail em uso (linhas 42–45) |

## Visão geral

| Resposta | PR02-02 | PR02-03 | PR02-04 | PR02-05 | FP | Desconsiderados |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| [R01](#r01) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R02](#r02) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R03](#r03) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R04](#r04) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R05](#r05) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R06](#r06) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R07](#r07) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R08](#r08) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R09](#r09) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R10](#r10) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R11](#r11) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
| [R12](#r12) | ✓ | ✓ | ✓ | ✓ | 0 | 0 |
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

- [R01](#r01) — A seção 'Trechos críticos' reapresenta os achados 1 a 3 (PR02-02, PR02-03 e PR02-04); não é achado novo.
- [R03](#r03) — A seção final 'Sem defeitos identificados em' lista pontos verificados sem defeito; não é achado.
- [R04](#r04) — O parágrafo final explica a interação entre os achados 2 e 3 (com apenas um campo inválido nem há rejeição; com ambos, a rejeição vem depois do save); não é achado novo.
- [R08](#r08) — A seção final 'Pontos verificados sem defeito' não contém achados. (O texto desta resposta aparece todo em negrito por causa da cópia; o conteúdo não é afetado.)
- [R10](#r10) — A frase final afirma que os demais fluxos de updateEmail estão corretos; não é achado.
- [R11](#r11) — A seção final 'Pontos verificados sem defeito' não contém achados.
- [R12](#r12) — A seção 'Exemplos que demonstram os defeitos' ilustra os achados 1 a 3, e a frase final diz não haver violação de CA33, CA35 ou CA36; não são achados novos.
- [R13](#r13) — A seção final 'Pontos verificados sem defeito' não contém achados.
- [R14](#r14) — A 'Observação sobre o que não é defeito' no fim não contém achados.

---

## R01

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R01.md)

*Observação:* A seção 'Trechos críticos' reapresenta os achados 1 a 3 (PR02-02, PR02-03 e PR02-04); não é achado novo.

### R01 · Achado 1 → TP · PR02-02

> No cadastro, input.id normalmente é undefined, enquanto o usuário já existente possui um id numérico. Assim, mesmo que findByEmail(email) encontre outro usuário, a condição tende a ser falsa. (...) Um segundo usuário pode ser cadastrado com um e-mail já existente.

**Por quê:** Aponta a causa (condição compara existingUser.id com input.id, indefinido na criação) e o efeito (e-mail duplicado aceito no cadastro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 2 → TP · PR02-04

> A validação combina os dois erros com &&. Isso só rejeita o cadastro quando nome e e-mail são inválidos ao mesmo tempo. (...) name="" com e-mail válido é aceito; nome válido com e-mail inválido ou ausente também é aceito.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (nome vazio ou e-mail inválido isolado é aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 3 → TP · PR02-03

> O usuário é persistido antes da validação dos dados. Quando nome vazio e e-mail inválido fazem a validação lançar AppError, o registro já permanece no repositório.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (tentativa rejeitada deixa o usuário gravado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R01 · Achado 4 → TP · PR02-05

> A verificação de unicidade durante atualização consulta apenas os primeiros 100 usuários. (...) é possível alterar o e-mail para um valor já pertencente, por exemplo, ao usuário 101, criando duplicidade.

**Por quê:** Aponta a causa (unicidade verificada só em findAll({ page: 0, size: 100 })) e o efeito (e-mail de usuário fora dos 100 primeiros aceito na atualização).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R02

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R02.md)

### R02 · Achado 1 → TP · PR02-03

> A operação de escrita no banco (this.userRepository.save) está sendo chamada antes da validação da validade do nome e do e-mail. Se os dados forem inválidos, a exceção será lançada, mas o registro já terá sido persistido no repositório.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (tentativa rejeitada deixa o usuário gravado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 2 → TP · PR02-02

> A lógica para barrar e-mails duplicados está com a condição incorreta: if (existingUser && existingUser.id === input.id). Como um novo cadastro não possui um id prévio no input, essa verificação sempre falhará

**Por quê:** Aponta a causa (comparação com input.id, indefinido na criação) e o efeito (múltiplos usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 3 → TP · PR02-04

> A validação de campos utiliza incorretamente o operador lógico && (E) na instrução if (isBlank(name) && !isValidEmail(email)). (...) Cadastros com nome vazio e e-mail válido (ou vice-versa) são indevidamente aceitos.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R02 · Achado 4 → TP · PR02-05

> Para verificar se o novo e-mail já pertence a outro usuário, o código realiza uma busca restrita à primeira página de paginação do repositório (this.userRepository.findAll({ page: 0, size: 100 })).

**Por quê:** Aponta a causa (busca só na primeira página de 100) e o efeito (duplicidade aceita com mais de 100 usuários).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R03

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R03.md)

*Observação:* A seção final 'Sem defeitos identificados em' lista pontos verificados sem defeito; não é achado.

### R03 · Achado 1 → TP · PR02-03

> o userRepository.save({ name, email }) é chamado antes da verificação de nome/e-mail. Quando a validação falha, o usuário já foi inserido no repositório e o #nextId já foi incrementado; o erro lançado não desfaz a escrita.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário inválido armazenado apesar do erro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 2 → TP · PR02-04

> o cadastro só é rejeitado quando o nome está vazio e o e-mail é inválido simultaneamente. Cada condição isolada passa.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita, inclusive e-mail ausente).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 3 → TP · PR02-02

> no cadastro, input.id é undefined (...), enquanto existingUser.id é sempre um número atribuído pelo repositório. A comparação é sempre falsa, então o 409 nunca é lançado. A condição correta seria apenas if (existingUser).

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (usuários com o mesmo e-mail criados normalmente).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R03 · Achado 4 → TP · PR02-05

> a checagem de duplicidade é feita sobre uma página fixa do repositório em vez de uma busca direta por e-mail (findByEmail, que já existe). Usuários fora dessa primeira página não entram na comparação.

**Por quê:** Aponta a causa (página fixa de 100) e o efeito (duplicidade aceita a partir do 101º usuário).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R04

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R04.md)

*Observação:* O parágrafo final explica a interação entre os achados 2 e 3 (com apenas um campo inválido nem há rejeição; com ambos, a rejeição vem depois do save); não é achado novo.

### R04 · Achado 1 → TP · PR02-02

> A comparação com input.id faz com que, normalmente, o conflito não seja detectado, pois o usuário sendo criado ainda não possui ID. (...) Um segundo usuário pode ser cadastrado com um e-mail já existente.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (e-mail duplicado aceito).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 2 → TP · PR02-04

> A validação usa &&, portanto rejeita somente quando nome e e-mail são inválidos simultaneamente. (...) Um usuário com nome vazio e e-mail válido é aceito; da mesma forma, um usuário com nome válido e e-mail ausente/inválido é aceito.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 3 → TP · PR02-03

> O usuário é persistido antes de validar nome e e-mail. Quando ambos são inválidos, a validação lança erro somente depois de o registro já ter sido criado.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário inválido permanece armazenado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R04 · Achado 4 → TP · PR02-05

> A verificação de unicidade na atualização examina somente os primeiros 100 usuários. Se houver mais de 100 cadastrados, um e-mail pertencente a um usuário fora desse intervalo não será encontrado.

**Por quê:** Aponta a causa (verificação limitada aos 100 primeiros) e o efeito (duplicidade aceita na atualização).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R05

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R05.md)

### R05 · Achado 1 → TP · PR02-02

> A lógica para verificar se o e-mail já existe valida se existingUser.id === input.id. Como em uma operação de criação o input.id é indefinido, a condição será falsa e o erro EMAIL_ALREADY_EXISTS nunca será lançado

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (múltiplos usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 2 → TP · PR02-04

> A validação dos dados de entrada utiliza o operador lógico && (isBlank(name) && !isValidEmail(email)). (...) Se apenas um deles for inválido, o cadastro é aceito.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 3 → TP · PR02-03

> A persistência no repositório (await this.userRepository.save(...)) é chamada antes da validação que verifica se o nome está em branco ou se o e-mail é inválido.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário armazenado em operação rejeitada).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R05 · Achado 4 → TP · PR02-05

> Para verificar se o novo e-mail já está em uso, o sistema busca apenas os primeiros 100 usuários (await this.userRepository.findAll({ page: 0, size: 100 })) em vez de buscar pelo e-mail específico.

**Por quê:** Aponta a causa (busca só nos 100 primeiros) e o efeito (atualização para e-mail já existente aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R06

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R06.md)

### R06 · Achado 1 → TP · PR02-02

> a condição só rejeita o cadastro quando o usuário encontrado pelo e-mail possui o mesmo id recebido em input.id. Em um cadastro normal, input.id não existe, enquanto existingUser.id é numérico.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (segundo usuário com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 2 → TP · PR02-04

> foi usado &&, portanto a operação só é rejeitada quando nome e e-mail são inválidos simultaneamente. (...) { name: "", email: "user@example.com" } (...) { name: "User", email: "invalid-email" }

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 3 → TP · PR02-03

> a chamada a save ocorre antes da validação. Quando nome e e-mail são ambos inválidos, a API lança erro, mas o usuário já foi inserido no repositório.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário criado parcialmente em tentativa rejeitada).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R06 · Achado 4 → TP · PR02-05

> a verificação de unicidade consulta somente os primeiros 100 usuários. Se o proprietário do e-mail estiver a partir do 101º registro, ele não será encontrado.

**Por quê:** Aponta a causa (findAll limitado a 100) e o efeito (duplicidade na atualização).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R07

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R07.md)

### R07 · Achado 1 → TP · PR02-02

> A condição de bloqueio de e-mail duplicado (if (existingUser && existingUser.id === input.id)) é logicamente falha para um cenário de criação. Como os dados de entrada para criação não possuem id, a condição sempre será falsa se o e-mail existir

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (múltiplos usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 2 → TP · PR02-03

> A chamada this.userRepository.save({ name, email }) ocorre antes da validação que verifica se o nome está em branco ou se o e-mail é válido.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (registro incorreto criado e depois o erro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 3 → TP · PR02-04

> A validação utiliza o operador && (if (isBlank(name) && !isValidEmail(email))). (...) Enviar apenas um nome vazio ou apenas um e-mail inválido resulta em sucesso.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R07 · Achado 4 → TP · PR02-05

> Para verificar se o novo e-mail já está em uso, o código busca apenas a primeira página do repositório (this.userRepository.findAll({ page: 0, size: 100 })) em vez de buscar o e-mail em toda a base (usando findByEmail).

**Por quê:** Aponta a causa (só a primeira página) e o efeito (duplicidade não detectada além dos 100 primeiros).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R08

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R08.md)

*Observação:* A seção final 'Pontos verificados sem defeito' não contém achados. (O texto desta resposta aparece todo em negrito por causa da cópia; o conteúdo não é afetado.)

### R08 · Achado 1 → TP · PR02-02

> no cadastro, input.id é sempre undefined (o id é gerado pelo repositório). Como existingUser.id é sempre um número, a comparação é sempre falsa e a exceção EMAIL_ALREADY_EXISTS jamais é lançada.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (dois usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 2 → TP · PR02-03

> o usuário é gravado antes da validação. Quando a validação falha, o erro é lançado, mas o registro já foi inserido no repositório (e o id já foi consumido), ficando visível em GET /users.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário inválido permanece).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 3 → TP · PR02-04

> a rejeição só ocorre quando ambos os campos são inválidos. Basta um deles estar correto para o cadastro passar. (...) nome válido + e-mail inválido ou ausente (undefined) → aceito

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R08 · Achado 4 → TP · PR02-05

> a verificação percorre apenas os 100 primeiros usuários retornados pela paginação. A partir do 101º registro, um e-mail já utilizado não é detectado.

**Por quê:** Aponta a causa (paginação de 100) e o efeito (duplicidade aceita na atualização).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R09

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R09.md)

### R09 · Achado 1 → TP · PR02-02

> Como no momento da criação o input normalmente não possui id (ou ele será diferente de um usuário já salvo), a condição existingUser.id === input.id será falsa e o erro nunca será lançado.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (usuários criados com e-mails já existentes).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 2 → TP · PR02-03

> O código salva o usuário no repositório antes de executar a validação de nome e e-mail. Se a validação falhar na linha seguinte, o erro será lançado para o cliente, mas o dado inválido já terá sido salvo no sistema.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário inválido armazenado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 3 → TP · PR02-04

> O uso do operador && (E) exige que ambos os campos estejam inválidos ao mesmo tempo para que o cadastro seja barrado.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (usuário sem nome ou com e-mail inválido cadastrado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R09 · Achado 4 → TP · PR02-05

> Para checar se o novo e-mail já está em uso, o sistema busca apenas a primeira página de usuários (limitado a 100 registros). Caso o e-mail duplicado pertença ao 101º usuário em diante, o sistema não o detectará.

**Por quê:** Aponta a causa (limite de 100 registros) e o efeito (duplicidade aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R10

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R10.md)

*Observação:* A frase final afirma que os demais fluxos de updateEmail estão corretos; não é achado.

### R10 · Achado 1 → TP · PR02-02

> No cadastro, input.id não é usado para criar o usuário e normalmente será undefined. Portanto, quando já existe um usuário com o mesmo e-mail, existingUser.id === input.id será falso e o cadastro continuará.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (múltiplos usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 2 → TP · PR02-04

> A validação usa &&, portanto só rejeita quando nome e e-mail são inválidos simultaneamente. Cada condição deveria ser suficiente para rejeitar o cadastro.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 3 → TP · PR02-03

> O usuário é persistido antes de verificar se os dados são válidos. Mesmo quando a validação posterior lança AppError, o registro já permanece no repositório.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário permanece após erro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R10 · Achado 4 → TP · PR02-05

> A verificação de unicidade na atualização considera somente os primeiros 100 usuários. (...) um e-mail pertencente a um usuário fora dessa primeira página não será detectado.

**Por quê:** Aponta a causa (primeiros 100 usuários) e o efeito (duplicidade aceita a partir do 101º).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R11

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R11.md)

*Observação:* A seção final 'Pontos verificados sem defeito' não contém achados.

### R11 · Achado 1 → TP · PR02-02

> A condição compara existingUser.id com input.id. No cadastro, input é o corpo da requisição, que não possui id (undefined), enquanto existingUser.id é sempre um número gerado pelo repositório. A comparação é sempre falsa

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (múltiplos usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 2 → TP · PR02-03

> A gravação acontece antes de qualquer validação de nome e e-mail. Quando a validação falha, a exceção é lançada, mas o usuário já foi inserido no repositório e o id já foi consumido. Não há rollback.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário inválido em GET /users).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 3 → TP · PR02-04

> O cadastro só é rejeitado quando o nome está vazio e o e-mail é inválido simultaneamente. Cada condição isolada deveria ser suficiente para rejeitar.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita e armazenada).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R11 · Achado 4 → TP · PR02-05

> A checagem de e-mail já em uso é feita sobre uma página fixa de no máximo 100 registros, em vez de consultar o repositório pelo e-mail (findByEmail (...)). Usuários a partir da posição 101 não são considerados na verificação.

**Por quê:** Aponta a causa (página fixa de 100) e o efeito (e-mails duplicados na atualização).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R12

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R12.md)

*Observação:* A seção 'Exemplos que demonstram os defeitos' ilustra os achados 1 a 3, e a frase final diz não haver violação de CA33, CA35 ou CA36; não são achados novos.

### R12 · Achado 1 → TP · PR02-02

> No cadastro normal, input.id tende a ser undefined; portanto, mesmo que findByEmail(email) encontre outro usuário, a condição normalmente será falsa.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (vários usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 2 → TP · PR02-04

> A validação usa &&, exigindo que nome e e-mail sejam inválidos simultaneamente para rejeitar o cadastro.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 3 → TP · PR02-03

> O usuário é persistido antes de verificar a validade de nome/e-mail. (...) Quando nome e e-mail são inválidos, save() cria o usuário e somente depois AppError("INVALID_USER") é lançado.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário fica cadastrado apesar do erro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R12 · Achado 4 → TP · PR02-05

> A verificação de unicidade na atualização considera apenas os primeiros 100 usuários do repositório. (...) Se o proprietário do e-mail estiver a partir do 101º registro, emailInUse será falso

**Por quê:** Aponta a causa (primeiros 100 usuários) e o efeito (outro usuário assume o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R13

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R13.md)

*Observação:* A seção final 'Pontos verificados sem defeito' não contém achados.

### R13 · Achado 1 → TP · PR02-03

> O save é executado antes da verificação de nome/e-mail. Quando a validação falha e o AppError é lançado, o usuário já foi inserido no repositório e recebeu um id, permanecendo na base.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário listável via GET /users apesar do erro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 2 → TP · PR02-04

> A rejeição só ocorre quando ambas as condições são inválidas. Entradas com apenas um dos campos inválidos passam na validação.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (nome vazio ou e-mail inválido/ausente cadastrado).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 3 → TP · PR02-02

> No cadastro, input.id é sempre undefined (o id é gerado pelo repositório), enquanto existingUser.id é sempre um número. A comparação é sempre falsa, portanto a exceção EMAIL_ALREADY_EXISTS nunca é lançada.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (dois usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R13 · Achado 4 → TP · PR02-05

> A checagem de duplicidade é feita sobre uma página fixa em vez de consultar o e-mail diretamente (há findByEmail disponível no repositório). Usuários fora dessa primeira página não são considerados.

**Por quê:** Aponta a causa (página fixa) e o efeito (duplicidade aceita com mais de 100 usuários).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R14

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R14.md)

*Observação:* A 'Observação sobre o que não é defeito' no fim não contém achados.

### R14 · Achado 1 → TP · PR02-02

> No cadastro, input.id é sempre undefined (...). Já existingUser.id é sempre um número atribuído pelo repositório. A comparação existingUser.id === input.id é, portanto, sempre falsa

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (dois ou mais usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 2 → TP · PR02-03

> O usuário é gravado no repositório e só depois os dados são validados. Quando a validação falha, a exceção é lançada, mas o registro já foi inserido em #users e permanece lá

**Por quê:** Aponta a causa (save antes da validação) e o efeito (usuário inválido persiste).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 3 → TP · PR02-04

> A rejeição só acontece quando ambas as condições são verdadeiras. Um cadastro com nome vazio e e-mail válido, ou com nome válido e e-mail inválido (inclusive ausente), passa pela validação sem erro.

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R14 · Achado 4 → TP · PR02-05

> A unicidade é verificada apenas sobre a primeira página de 100 registros, em vez de consultar o repositório pelo e-mail (findByEmail, que já existe).

**Por quê:** Aponta a causa (primeira página de 100) e o efeito (e-mails duplicados na atualização).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

---

## R15

**Encontrou 4 de 4 (PR02-02, PR02-03, PR02-04, PR02-05) · FP: 0 · Desconsiderados: 0** · [resposta completa](cegas/R15.md)

### R15 · Achado 1 → TP · PR02-02

> A verificação de e-mail duplicado está condicionada a existingUser.id === input.id. Como no cadastro o input.id não costuma existir (é gerado no repositório), essa condição será falsa, burlando a verificação.

**Por quê:** Aponta a causa (comparação com input.id) e o efeito (múltiplos usuários com o mesmo e-mail).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 2 → TP · PR02-03

> A chamada this.userRepository.save({ name, email }) é executada antes das validações de formato de nome e e-mail.

**Por quê:** Aponta a causa (save antes da validação) e o efeito (registro criado indevidamente e mantido após o erro).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 3 → TP · PR02-04

> A validação utiliza o operador lógico && (isBlank(name) && !isValidEmail(email)). (...) Permite criar usuário com nome vazio (desde que o e-mail seja válido) ou com e-mail inválido (desde que o nome não seja vazio).

**Por quê:** Aponta a causa (&& em vez de ||) e o efeito (invalidade isolada aceita).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 

### R15 · Achado 4 → TP · PR02-05

> A checagem para garantir que o novo e-mail não pertence a outro usuário busca apenas a primeira página de usuários (findAll({ page: 0, size: 100 })).

**Por quê:** Aponta a causa (só a primeira página) e o efeito (duplicidade quando o dono do e-mail está fora dos 100 primeiros).

- [ ] Concordo
- [ ] Discordo → classificação que eu daria: 
