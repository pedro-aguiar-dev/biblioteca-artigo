# Sistema de Biblioteca — experimento de LLMs em Pull Requests

Este repositório contém o sistema de biblioteca implementado para um experimento controlado de avaliação de LLMs em revisão de Pull Requests. O estudo compara ChatGPT GPT-5.6 Sol, Claude Opus 5 e Gemini 3.1 Pro na identificação de 25 defeitos funcionais distribuídos em seis Pull Requests.

O acervo foi publicado após o encerramento da coleta. Ele inclui o código final, as versões documentais, entradas submetidas aos modelos, respostas brutas, classificação cega, ground truth, testes, mutantes, oráculos e resultados consolidados.

## Comece pela documentação

- [Relatório completo](documentacao-final/RELATORIO-COMPLETO-EXPERIMENTO.md)
- [Especificação atualizada](documentacao-final/ESPECIFICACAO-ATUALIZADA.md)
- [Guia experimental atualizado](documentacao-final/GUIA-EXPERIMENTAL-ATUALIZADO.md)
- [Índice dos artefatos](documentacao-final/INDICE-DOS-ARTEFATOS.md)
- [Acervo experimental e instruções de reprodução](experimento/README.md)

As versões em Word e PDF dos três documentos principais estão em `documentacao-final/`.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `src/` | API final da biblioteca em Node.js e Express |
| `documentacao-final/` | relatório, especificação, guia, planilhas e PDFs originais |
| `experimento/` | dados, testes, ground truth, respostas e ferramentas do estudo |
| tags `prNN-*` | baselines, versões experimentais e correções de cada Pull Request |

## Executar o sistema

Use Node.js 24 ou superior.

```powershell
npm install
npm start
```

## Reproduzir os testes do experimento

```powershell
cd experimento
npm ci
npm test
```

A suíte deve concluir com 112 testes aprovados.

## Resultados resumidos

Foram analisadas 90 respostas válidas, correspondentes a 375 oportunidades de detecção. O conjunto completo obteve 365 verdadeiros positivos, 6 falsos positivos e 10 falsos negativos. Os resultados detalhados estão no relatório e nos arquivos de `experimento/coleta/`.
