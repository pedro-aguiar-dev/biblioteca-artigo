# Roteiro de teste manual — PR01 Cadastro de livros

## 1. Subir o servidor (terminal 1)

```powershell
cd <raiz-do-repositorio>
npm start
```

Deve aparecer: `Library API listening on http://localhost:3000`.
Os dados ficam em memória: reiniciar o servidor zera o acervo.

## 2. Preparar o atalho de requisições (terminal 2, PowerShell)

Cole uma vez por sessão do terminal:

```powershell
function Api {
  param([string]$Metodo, [string]$Caminho, $Corpo)
  $params = @{ Method = $Metodo; Uri = "http://localhost:3000$Caminho"; UseBasicParsing = $true }
  if ($null -ne $Corpo) {
    $params.Body = [System.Text.Encoding]::UTF8.GetBytes(($Corpo | ConvertTo-Json -Compress))
    $params.ContentType = "application/json; charset=utf-8"
  }
  try { $r = Invoke-WebRequest @params; "$($r.StatusCode) $($r.Content)" }
  catch { "$($_.Exception.Response.StatusCode.value__) $($_.ErrorDetails.Message)" }
}
```

## 3. Casos (execute em ordem, com o servidor recém-iniciado)

| # | Requisito | Comando | Resultado esperado |
|---|---|---|---|
| 1 | CT01 / CA01 | `Api POST /books @{ isbn="9780000000001"; title="Estruturas de Dados"; author="Ana Souza"; totalCopies=2 }` | `201` com `"totalCopies":2,"availableCopies":2,"id":1` |
| 2 | CA01 | `Api POST /books @{ isbn="9780000000002"; title="Clean Code"; author="Robert Martin"; totalCopies=5; availableCopies=1 }` | `201` com `"availableCopies":5` (o valor enviado é ignorado) |
| 3 | CT02 / CA02 | `Api POST /books @{ isbn="9780000000001"; title="Estruturas de Dados"; author="Ana Souza"; totalCopies=2 }` | `409 {"error":"ISBN_ALREADY_EXISTS"}` |
| 4 | CA02 | `Api POST /books @{ isbn="9780000000001"; title="Estrutura de Dados"; author="Outro Autor"; totalCopies=1 }` | `409 {"error":"ISBN_ALREADY_EXISTS"}` |
| 5 | CA02 | `Api POST /books @{ title="Sem ISBN"; author="Ana Souza"; totalCopies=1 }` | `400 {"error":"INVALID_BOOK"}` |
| 6 | CT03 / CA03 | `Api POST /books @{ isbn="9780000000003"; title=""; author="Ana Souza"; totalCopies=1 }` | `400 {"error":"INVALID_BOOK"}` |
| 7 | CA03 | `Api POST /books @{ isbn="9780000000003"; title="Algoritmos"; author="   "; totalCopies=1 }` | `400 {"error":"INVALID_BOOK"}` |
| 8 | CT03 / CA04 | `Api POST /books @{ isbn="9780000000003"; title="Algoritmos"; author="Ana Souza"; totalCopies=0 }` | `400 {"error":"INVALID_QUANTITY"}` |
| 9 | CA04 | `Api POST /books @{ isbn="9780000000003"; title="Algoritmos"; author="Ana Souza"; totalCopies=-1 }` | `400 {"error":"INVALID_QUANTITY"}` |
| 10 | CA05 | `Api GET /books` | `200` com **apenas** os livros dos casos 1 e 2 (ids 1 e 2), ambos com `availableCopies` igual a `totalCopies` |

Se todos os resultados baterem, a funcionalidade está conforme RF01 (CA01–CA05) e CT01–CT03.
