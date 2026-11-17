# Executa o roteiro manual do PR01 contra o servidor real.
# Sobe o servidor numa porta própria, roda os 10 casos, compara com o esperado e derruba o servidor.
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

$casos = @(
  @{ Id = 1;  Req = "CT01/CA01"; Metodo = "POST"; Corpo = @{ isbn = "9780000000001"; title = "Estruturas de Dados"; author = "Ana Souza"; totalCopies = 2 }; Status = 201; Contem = @('"totalCopies":2', '"availableCopies":2', '"id":1') },
  @{ Id = 2;  Req = "CA01";      Metodo = "POST"; Corpo = @{ isbn = "9780000000002"; title = "Clean Code"; author = "Robert Martin"; totalCopies = 5; availableCopies = 1 }; Status = 201; Contem = @('"availableCopies":5') },
  @{ Id = 3;  Req = "CT02/CA02"; Metodo = "POST"; Corpo = @{ isbn = "9780000000001"; title = "Estruturas de Dados"; author = "Ana Souza"; totalCopies = 2 }; Status = 409; Contem = @('ISBN_ALREADY_EXISTS') },
  @{ Id = 4;  Req = "CA02";      Metodo = "POST"; Corpo = @{ isbn = "9780000000001"; title = "Estrutura de Dados"; author = "Outro Autor"; totalCopies = 1 }; Status = 409; Contem = @('ISBN_ALREADY_EXISTS') },
  @{ Id = 5;  Req = "CA02";      Metodo = "POST"; Corpo = @{ title = "Sem ISBN"; author = "Ana Souza"; totalCopies = 1 }; Status = 400; Contem = @('INVALID_BOOK') },
  @{ Id = 6;  Req = "CT03/CA03"; Metodo = "POST"; Corpo = @{ isbn = "9780000000003"; title = ""; author = "Ana Souza"; totalCopies = 1 }; Status = 400; Contem = @('INVALID_BOOK') },
  @{ Id = 7;  Req = "CA03";      Metodo = "POST"; Corpo = @{ isbn = "9780000000003"; title = "Algoritmos"; author = "   "; totalCopies = 1 }; Status = 400; Contem = @('INVALID_BOOK') },
  @{ Id = 8;  Req = "CT03/CA04"; Metodo = "POST"; Corpo = @{ isbn = "9780000000003"; title = "Algoritmos"; author = "Ana Souza"; totalCopies = 0 }; Status = 400; Contem = @('INVALID_QUANTITY') },
  @{ Id = 9;  Req = "CA04";      Metodo = "POST"; Corpo = @{ isbn = "9780000000003"; title = "Algoritmos"; author = "Ana Souza"; totalCopies = -1 }; Status = 400; Contem = @('INVALID_QUANTITY') },
  @{ Id = 10; Req = "CA05";      Metodo = "GET";  Corpo = $null; Status = 200; Contem = @('"id":1', '"id":2'); NaoContem = @('"id":3') }
)

$env:PORT = "$Porta"
$servidor = Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $Repo -PassThru -WindowStyle Hidden
Remove-Item Env:PORT

try {
  $pronto = $false
  for ($i = 0; $i -lt 20 -and -not $pronto; $i++) {
    Start-Sleep -Milliseconds 250
    try { Invoke-WebRequest "$base/books" -UseBasicParsing | Out-Null; $pronto = $true } catch {}
  }
  if (-not $pronto) { throw "Servidor não respondeu em $base" }

  $divergencias = 0
  foreach ($caso in $casos) {
    $r = Invocar $caso.Metodo "/books" $caso.Corpo
    $ok = $r.Status -eq $caso.Status
    foreach ($trecho in $caso.Contem) { if ($r.Body -notlike "*$trecho*") { $ok = $false } }
    foreach ($trecho in $caso.NaoContem) { if ($r.Body -like "*$trecho*") { $ok = $false } }
    if (-not $ok) { $divergencias++ }
    $situacao = if ($ok) { "OK        " } else { "DIVERGENTE" }
    "{0,2} {1,-10} {2} esperado {3} / obtido {4}  {5}" -f $caso.Id, $caso.Req, $situacao, $caso.Status, $r.Status, $r.Body
  }
  ""
  if ($divergencias -eq 0) { "Roteiro PR01: todos os 10 casos conforme o esperado." }
  else { "Roteiro PR01: $divergencias caso(s) divergente(s)." }
} finally {
  Stop-Process -Id $servidor.Id -Force -ErrorAction SilentlyContinue
}
