param([string]$Repo = (Join-Path $PSScriptRoot "..\.."), [int]$Porta = 3100)
$base = "http://localhost:$Porta"
function Invocar([string]$Metodo, [string]$Caminho, $Corpo) {
  $p = @{ Method=$Metodo; Uri="$base$Caminho"; UseBasicParsing=$true }
  if ($null -ne $Corpo) { $p.Body=[Text.Encoding]::UTF8.GetBytes(($Corpo|ConvertTo-Json -Compress)); $p.ContentType="application/json; charset=utf-8" }
  try { $r=Invoke-WebRequest @p; @{ Status=[int]$r.StatusCode; Body=$r.Content } }
  catch { @{ Status=[int]$_.Exception.Response.StatusCode.value__; Body=$_.ErrorDetails.Message } }
}
$env:PORT="$Porta"
$servidor=Start-Process node -ArgumentList "src/server.js" -WorkingDirectory $Repo -PassThru -WindowStyle Hidden
Remove-Item Env:PORT
try {
  for($i=0;$i-lt 20;$i++){ Start-Sleep -Milliseconds 250; try { Invoke-WebRequest "$base/books" -UseBasicParsing|Out-Null; break } catch {} }
  $u=Invocar POST /users @{name="Ana";email="ana@exemplo.com"}
  $b=Invocar POST /books @{isbn="1";title="Livro";author="Autor";totalCopies=2}
  $e=Invocar POST /loans @{userId=1;bookId=1;currentDate="2026-01-01"}
  $casos=@()
  $casos+=@{N=1;R=Invocar POST "/loans/1/return" @{currentDate="2026-02-01"};S=200;T='"returnDate":"2026-02-01"'}
  $casos+=@{N=2;R=Invocar GET /books $null;S=200;T='"availableCopies":2'}
  $casos+=@{N=3;R=Invocar POST "/loans/1/return" @{currentDate="2026-02-02"};S=409;T='LOAN_ALREADY_RETURNED'}
  $casos+=@{N=4;R=Invocar GET /books $null;S=200;T='"availableCopies":2'}
  $casos+=@{N=5;R=Invocar POST "/loans/999/return" @{currentDate="2026-02-02"};S=404;T='LOAN_NOT_FOUND'}
  $casos+=@{N=6;R=Invocar POST "/loans/1/return" @{currentDate="invalida"};S=400;T='INVALID_RETURN'}
  $falhas=0
  foreach($c in $casos){$ok=$c.R.Status-eq$c.S-and$c.R.Body-like"*$($c.T)*";if(-not$ok){$falhas++};"{0} {1} esperado {2} / obtido {3}"-f$c.N,$(if($ok){"OK"}else{"DIVERGENTE"}),$c.S,$c.R.Status}
  if($falhas-eq 0){"Roteiro PR05: todos os 6 casos conforme o esperado."}else{"Roteiro PR05: $falhas caso(s) divergente(s)."}
} finally { Stop-Process -Id $servidor.Id -Force -ErrorAction SilentlyContinue }
