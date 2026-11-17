# Executa o roteiro manual do PR03 contra o servidor real.
# Sobe o servidor, cadastra o acervo de teste, roda as consultas, compara com o esperado e derruba o servidor.
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

$acervo = @(
  @{ isbn = "1"; title = "Clean Code"; author = "Robert C. Martin"; totalCopies = 1 },
  @{ isbn = "2"; title = "Clean Architecture"; author = "Robert C. Martin"; totalCopies = 1 },
  @{ isbn = "3"; title = "Introdução ao Código Limpo"; author = "Ana Souza"; totalCopies = 1 },
  @{ isbn = "4"; title = "Java Efetivo"; author = "Joshua Bloch"; totalCopies = 1 },
  @{ isbn = "5"; title = "Programação Moderna"; author = "Carla Java"; totalCopies = 1 }
)
for ($i = 1; $i -le 12; $i++) { $acervo += @{ isbn = "V$i"; title = "Volume $i"; author = "Autor Coletivo"; totalCopies = 1 } }

$casos = @(
  @{ Id = 1; Req = "CT07/CA11"; Caminho = "/books/search?q=cLEAN%20code"; Status = 200; Contem = @('"title":"Clean Code"'); NaoContem = @('Clean Architecture') },
  @{ Id = 2; Req = "CT08/CA12"; Caminho = "/books/search?q=martin"; Status = 200; Contem = @('"title":"Clean Code"', '"title":"Clean Architecture"') },
  @{ Id = 3; Req = "CT09/CA13"; Caminho = "/books/search?q=inexistente"; Status = 200; Igual = "[]" },
  @{ Id = 4; Req = "CA10";      Caminho = "/books/search?q=limpo"; Status = 200; Contem = @('"isbn":"3"') },
  @{ Id = 5; Req = "CA10/CA11"; Caminho = "/books/search?q=SOUZA"; Status = 200; Contem = @('"isbn":"3"') },
  @{ Id = 6; Req = "CA12";      Caminho = "/books/search?q=java"; Status = 200; Contem = @('"title":"Java Efetivo"', '"title":"Programação Moderna"') },
  @{ Id = 7; Req = "CA12";      Caminho = "/books/search?q=volume"; Status = 200; Contem = @('"title":"Volume 1"', '"title":"Volume 11"', '"title":"Volume 12"') },
  @{ Id = 8; Req = "Termo";     Caminho = "/books/search?q="; Status = 400; Contem = @('INVALID_SEARCH_TERM') }
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

  $falhasCadastro = @($acervo | Where-Object { (Invocar "POST" "/books" $_).Status -ne 201 }).Count
  "Acervo de teste: $($acervo.Count) livros cadastrados ($falhasCadastro falha(s))."
  ""

  $divergencias = 0
  foreach ($caso in $casos) {
    $r = Invocar "GET" $caso.Caminho $null
    $ok = $r.Status -eq $caso.Status
    foreach ($trecho in $caso.Contem) { if ($r.Body -notlike "*$trecho*") { $ok = $false } }
    foreach ($trecho in $caso.NaoContem) { if ($r.Body -like "*$trecho*") { $ok = $false } }
    if ($caso.Igual -and $r.Body -ne $caso.Igual) { $ok = $false }
    if (-not $ok) { $divergencias++ }
    $situacao = if ($ok) { "OK        " } else { "DIVERGENTE" }
    $resumo = if ($r.Body.Length -gt 120) { $r.Body.Substring(0, 120) + "…" } else { $r.Body }
    "{0,2} {1,-10} {2} {3,-30} esperado {4} / obtido {5}  {6}" -f $caso.Id, $caso.Req, $situacao, $caso.Caminho, $caso.Status, $r.Status, $resumo
  }
  ""
  if ($divergencias -eq 0 -and $falhasCadastro -eq 0) { "Roteiro PR03: todos os $($casos.Count) casos conforme o esperado." }
  else { "Roteiro PR03: $divergencias caso(s) divergente(s)." }
} finally {
  Stop-Process -Id $servidor.Id -Force -ErrorAction SilentlyContinue
}
