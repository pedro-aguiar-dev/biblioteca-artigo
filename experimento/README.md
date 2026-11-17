# Acervo experimental

Esta pasta reúne todos os artefatos usados na avaliação de LLMs em Pull Requests do Sistema de Biblioteca. Ela foi adicionada ao repositório após o encerramento da coleta, para permitir auditoria e reprodução por outros pesquisadores.

## Conteúdo

| Pasta ou arquivo | Conteúdo |
|---|---|
| `coleta/` | respostas brutas, versões anonimizadas, classificações, revisões e métricas de cada PR |
| `ground-truth/` | defeitos planejados, causas-raiz, requisitos e comportamento esperado por PR |
| `submissoes/` | prompt fixo, requisitos, descrições, diffs e entradas fornecidas às LLMs |
| `mutantes/` | versões com um defeito isolado para verificar independência |
| `testes/` | testes de baseline e testes-oráculo |
| `testes-manuais/` | roteiros HTTP usados na validação manual automatizada |
| `resultados/` | matrizes de independência dos oráculos |
| `ferramentas/` | scripts de anonimização, classificação e cálculo de métricas |
| `DECISOES.md` | decisões metodológicas, desvios e linha do tempo completa |
| `PUBLICACAO.md` | registro da publicação pública do acervo |

## Reprodução

Use Node.js 24 ou superior. Na raiz do repositório, execute:

```powershell
cd experimento
npm ci
npm test
```

Os testes internos importam o sistema final de `../src`. Para executar um roteiro HTTP, use, por exemplo:

```powershell
.\testes-manuais\PR06-executar.ps1 -Repo ..
```

`node_modules/` não é versionado porque é reproduzível a partir de `package-lock.json`.

## Dados de coleta

As respostas brutas foram preservadas como parte do registro científico. As métricas oficiais usam 90 respostas válidas. A primeira coleta da PR06 foi preservada, mas excluída da análise porque a entrada não continha o contexto necessário do helper `persistLoan`; a coleta válida correspondente está identificada nos registros e resultados da PR06.
