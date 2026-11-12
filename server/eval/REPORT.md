# HOLO-NET — avaliação de consulta

Este relatório mede apenas 30 perguntas escritas para a mesma base curada. 
Não é teste cego, não mede o desempenho de LLM real nem treina modelos.

| Indicador | Medição |
| --- | ---: |
| Dataset | holonet-readonly-curated-v0.1 |
| Roteamento | rules |
| Casos | 30 |
| Acertos do conjunto curado | 30 (100.0%) |
| Respondidos | 23 |
| Abstenções | 3 |
| Solicitações bloqueadas | 4 |
| Mediana local in-processo | 0.10 ms |
| P95 local in-processo | 0.34 ms |

## Intenções

- abstain: 2
- affiliation: 7
- blocked: 4
- compare: 2
- lore: 2
- ships: 2
- stock: 11

## Limites

- O conjunto não é holdout de perguntas novas.
- Os estoques são fictícios e não representam quantidades Canon.
- Os tempos excluem rede, navegador e inferência de modelos.
- Busca histórica atual: lexical; não embeddings nem vetores.
- Antes de testar um LLM, criar 20 perguntas novas e separar teste de desenvolvimento.

## Falhas

Nenhuma falha neste conjunto curado.
