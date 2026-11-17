# Executa o roteiro manual do PR04 contra o servidor real.
param(
  [string]$Repo = (Join-Path $PSScriptRoot "..\.."),
  [int]$Porta = 3100
)

$base = "http://localhost:$Porta"

function Invocar([string]$Metodo, [string]$Caminho, $Corpo) {
  $params = @{ Method = $Metodo; Uri = "$base$Caminho"; UseBasicParsing = $true }
  if ($null -ne $Corpo) {
    $params.Body = [System.Text.Encoding]::UTF8.GetBytes(($Corpo | ConvertTo-Json -Compress))
    $params.ContentType = "application/json; charset=utf-8"
  }
  try {
    $r = Invoke-WebRequest @params
    return @{ Status = [int]$r.StatusCode; Body = $r.Content }
  } catch {
    return @{ Status = [int]$_.Exception.Response.StatusCode.value__; Body = $_.ErrorDetails.Message }
  }
}

$env:PORT = "$Porta"
$servidor = Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $Repo -PassThru -WindowStyle Hidden
Remove-Item Env:PORT

try {
  $pronto = $false
  for ($i = 0; $i -lt 20 -and -not $pronto; $i++) {
    Start-Sleep -Milliseconds 250
    try { Invoke-WebRequest "$base/books" -UseBasicParsing | Out-Null; $pronto = $true } catch {}
  }
  if (-not $pronto) { throw "Servidor nao respondeu em $base" }

  $usuario = Invocar "POST" "/users" @{ name = "Ana"; email = "ana@exemplo.com" }
  $livro1 = Invocar "POST" "/books" @{ isbn = "1"; title = "Livro 1"; author = "Autor"; totalCopies = 2 }
  $livro2 = Invocar "POST" "/books" @{ isbn = "2"; title = "Livro 2"; author = "Autor"; totalCopies = 1 }
  $livro3 = Invocar "POST" "/books" @{ isbn = "3"; title = "Livro 3"; author = "Autor"; totalCopies = 1 }
  $livro4 = Invocar "POST" "/books" @{ isbn = "4"; title = "Livro 4"; author = "Autor"; totalCopies = 1 }
  $livro5 = Invocar "POST" "/books" @{ isbn = "5"; title = "Sem estoque"; author = "Autor"; totalCopies = 1 }

  $casos = @()
  $casos += @{ Id = 1; Req = "CT10/CA15"; R = Invocar "POST" "/loans" @{ userId = 1; bookId = 1; currentDate = "2026-09-22" }; Status = 201; Contem = @('"dueDate":"2026-10-06"', '"renewalCount":0') }
  $casos += @{ Id = 2; Req = "CA16"; R = Invocar "GET" "/books" $null; Status = 200; Contem = @('"isbn":"1"', '"availableCopies":1') }
  $casos += @{ Id = 3; Req = "CT15/CA20"; R = Invocar "POST" "/loans" @{ userId = 1; bookId = 1; currentDate = "2026-09-22" }; Status = 409; Contem = @('BOOK_ALREADY_BORROWED') }
  $casos += @{ Id = 4; Req = "CT11/CA14"; R = Invocar "POST" "/loans" @{ userId = 999; bookId = 2; currentDate = "2026-09-22" }; Status = 404; Contem = @('USER_NOT_FOUND') }
  $casos += @{ Id = 5; Req = "CT11/CA14"; R = Invocar "POST" "/loans" @{ userId = 1; bookId = 999; currentDate = "2026-09-22" }; Status = 404; Contem = @('BOOK_NOT_FOUND') }
  $casos += @{ Id = 6; Req = "CA19"; R = Invocar "POST" "/loans" @{ userId = 1; bookId = 2; currentDate = "2026-09-22" }; Status = 201; Contem = @('"bookId":2') }
  $casos += @{ Id = 7; Req = "CA19"; R = Invocar "POST" "/loans" @{ userId = 1; bookId = 3; currentDate = "2026-09-22" }; Status = 201; Contem = @('"bookId":3') }
  $casos += @{ Id = 8; Req = "CT14/CA19"; R = Invocar "POST" "/loans" @{ userId = 1; bookId = 4; currentDate = "2026-09-22" }; Status = 409; Contem = @('LOAN_LIMIT_REACHED') }

  $usuario2 = Invocar "POST" "/users" @{ name = "Bruno"; email = "bruno@exemplo.com" }
  $primeiro = Invocar "POST" "/loans" @{ userId = 2; bookId = 5; currentDate = "2026-09-22" }
  $casos += @{ Id = 9; Req = "CT12/CA17"; R = Invocar "POST" "/loans" @{ userId = 2; bookId = 5; currentDate = "2026-09-22" }; Status = 409; Contem = @('BOOK_UNAVAILABLE') }
  $casos += @{ Id = 10; Req = "CA21"; R = Invocar "GET" "/books" $null; Status = 200; Contem = @('"isbn":"4"', '"availableCopies":1', '"isbn":"5"', '"availableCopies":0') }

  $divergencias = 0
  foreach ($caso in $casos) {
    $ok = $caso.R.Status -eq $caso.Status
    foreach ($trecho in $caso.Contem) { if ($caso.R.Body -notlike "*$trecho*") { $ok = $false } }
    if (-not $ok) { $divergencias++ }
    $situacao = if ($ok) { "OK        " } else { "DIVERGENTE" }
    $resumo = if ($caso.R.Body.Length -gt 150) { $caso.R.Body.Substring(0, 150) + "..." } else { $caso.R.Body }
    "{0,2} {1,-11} {2} esperado {3} / obtido {4}  {5}" -f $caso.Id, $caso.Req, $situacao, $caso.Status, $caso.R.Status, $resumo
  }
  ""
  if ($divergencias -eq 0) { "Roteiro PR04: todos os $($casos.Count) casos conforme o esperado." }
  else { "Roteiro PR04: $divergencias caso(s) divergente(s)." }
} finally {
  Stop-Process -Id $servidor.Id -Force -ErrorAction SilentlyContinue
}
