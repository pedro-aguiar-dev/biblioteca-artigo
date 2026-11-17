# Executa o roteiro manual do PR02 contra o servidor real.
# Sobe o servidor numa porta própria, roda os casos em ordem, compara com o esperado e derruba o servidor.
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
  @{ Id = 1;  Req = "CT04/CA06"; Metodo = "POST";  Caminho = "/users"; Corpo = @{ name = "Ana Souza"; email = "ana@exemplo.com" }; Status = 201; Contem = @('"email":"ana@exemplo.com"', '"id":1') },
  @{ Id = 2;  Req = "CT05/CA07"; Metodo = "POST";  Caminho = "/users"; Corpo = @{ name = "Outra Pessoa"; email = "ana@exemplo.com" }; Status = 409; Contem = @('EMAIL_ALREADY_EXISTS') },
  @{ Id = 3;  Req = "CA07";      Metodo = "POST";  Caminho = "/users"; Corpo = @{ name = "Sem Email" }; Status = 400; Contem = @('INVALID_USER') },
  @{ Id = 4;  Req = "CT06/CA08"; Metodo = "POST";  Caminho = "/users"; Corpo = @{ name = ""; email = "vazio@exemplo.com" }; Status = 400; Contem = @('INVALID_USER') },
  @{ Id = 5;  Req = "CT06/CA08"; Metodo = "POST";  Caminho = "/users"; Corpo = @{ name = "Carla"; email = "carla.exemplo.com" }; Status = 400; Contem = @('INVALID_USER') },
  @{ Id = 6;  Req = "CA09";      Metodo = "GET";   Caminho = "/users"; Corpo = $null; Status = 200; Contem = @('"id":1'); NaoContem = @('"id":2') },
  @{ Id = 7;  Req = "CA06";      Metodo = "POST";  Caminho = "/users"; Corpo = @{ name = "Bruno Lima"; email = "bruno@exemplo.com" }; Status = 201; Contem = @('"id":2') },
  @{ Id = 8;  Req = "CA33";      Metodo = "PATCH"; Caminho = "/users/2/email"; Corpo = @{ email = "invalido" }; Status = 400; Contem = @('INVALID_EMAIL') },
  @{ Id = 9;  Req = "CA34";      Metodo = "PATCH"; Caminho = "/users/2/email"; Corpo = @{ email = "ana@exemplo.com" }; Status = 409; Contem = @('EMAIL_ALREADY_EXISTS') },
  @{ Id = 10; Req = "CA34";      Metodo = "PATCH"; Caminho = "/users/2/email"; Corpo = @{ email = "bruno@exemplo.com" }; Status = 200; Contem = @('"email":"bruno@exemplo.com"') },
  @{ Id = 11; Req = "RF07";      Metodo = "PATCH"; Caminho = "/users/2/email"; Corpo = @{ email = "bruno.novo@exemplo.com" }; Status = 200; Contem = @('"email":"bruno.novo@exemplo.com"', '"name":"Bruno Lima"') },
  @{ Id = 12; Req = "CA35";      Metodo = "PATCH"; Caminho = "/users/99/email"; Corpo = @{ email = "x@exemplo.com" }; Status = 404; Contem = @('USER_NOT_FOUND') },
  @{ Id = 13; Req = "CA36";      Metodo = "GET";   Caminho = "/users"; Corpo = $null; Status = 200; Contem = @('ana@exemplo.com', 'bruno.novo@exemplo.com'); NaoContem = @('"id":3', 'invalido') },
  @{ Id = 14; Req = "Listagem";  Metodo = "GET";   Caminho = "/users?page=1&size=1"; Corpo = $null; Status = 200; Contem = @('"id":2'); NaoContem = @('"id":1') },
  @{ Id = 15; Req = "Listagem";  Metodo = "GET";   Caminho = "/users?size=0"; Corpo = $null; Status = 400; Contem = @('INVALID_PAGINATION') }
)

$env:PORT = "$Porta"
$servidor = Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $Repo -PassThru -WindowStyle Hidden
Remove-Item Env:PORT

try {
  $pronto = $false
  for ($i = 0; $i -lt 20 -and -not $pronto; $i++) {
    Start-Sleep -Milliseconds 250
    try { Invoke-WebRequest "$base/users" -UseBasicParsing | Out-Null; $pronto = $true } catch {}
  }
  if (-not $pronto) { throw "Servidor não respondeu em $base" }

  $divergencias = 0
  foreach ($caso in $casos) {
    $r = Invocar $caso.Metodo $caso.Caminho $caso.Corpo
    $ok = $r.Status -eq $caso.Status
    foreach ($trecho in $caso.Contem) { if ($r.Body -notlike "*$trecho*") { $ok = $false } }
    foreach ($trecho in $caso.NaoContem) { if ($r.Body -like "*$trecho*") { $ok = $false } }
    if (-not $ok) { $divergencias++ }
    $situacao = if ($ok) { "OK        " } else { "DIVERGENTE" }
    "{0,2} {1,-10} {2} {3,-5} {4,-22} esperado {5} / obtido {6}  {7}" -f $caso.Id, $caso.Req, $situacao, $caso.Metodo, $caso.Caminho, $caso.Status, $r.Status, $r.Body
  }
  ""
  if ($divergencias -eq 0) { "Roteiro PR02: todos os $($casos.Count) casos conforme o esperado." }
  else { "Roteiro PR02: $divergencias caso(s) divergente(s)." }
} finally {
  Stop-Process -Id $servidor.Id -Force -ErrorAction SilentlyContinue
}
