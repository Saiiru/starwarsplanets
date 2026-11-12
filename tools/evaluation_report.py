"""Pure-Python assessment of an existing HOLO-NET evaluation JSON file.

This does NOT run or train a model; it analyzes finite, curated regression questions.
"""
from __future__ import annotations

import argparse
import json
import math
from collections import Counter
from pathlib import Path
from statistics import median


def percentile(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    return ordered[max(0, min(len(ordered) - 1, math.ceil(q * len(ordered)) - 1))]


def analyze(document: dict) -> dict:
    cases = document.get("results") or []
    if not cases:
        raise ValueError("No per-case results found; execute npm run eval first.")
    passed = sum(item.get("passed") is True for item in cases)
    count = Counter(item.get("intent", "unknown") for item in cases)
    latencies = [
        float(item["latencyMs"]) for item in cases
        if isinstance(item.get("latencyMs"), (int, float))
    ]
    return {
        "dataset": document.get("dataset", "unspecified"),
        "mode": document.get("mode", "unspecified"),
        "total": len(cases),
        "passed": passed,
        "rate": passed / len(cases),
        "blocked": sum(item.get("status") == "blocked" for item in cases),
        "abstained": sum(item.get("status") == "unknown" for item in cases),
        "answered": sum(item.get("status") == "answered" for item in cases),
        "intents": dict(sorted(count.items())),
        "median_ms": median(latencies) if latencies else 0,
        "p95_ms": percentile(latencies, .95),
        "failures": [item.get("id") for item in cases if item.get("passed") is not True],
    }


def markdown(stats: dict) -> str:
    lines = [
        "# HOLO-NET — avaliação de consulta",
        "",
        "Este relatório mede apenas 30 perguntas escritas para a mesma base curada. ",
        "Não é teste cego, não mede o desempenho de LLM real nem treina modelos.",
        "",
        "| Indicador | Medição |",
        "| --- | ---: |",
        f"| Dataset | {stats['dataset']} |",
        f"| Roteamento | {stats['mode']} |",
        f"| Casos | {stats['total']} |",
        f"| Acertos do conjunto curado | {stats['passed']} ({stats['rate']:.1%}) |",
        f"| Respondidos | {stats['answered']} |",
        f"| Abstenções | {stats['abstained']} |",
        f"| Solicitações bloqueadas | {stats['blocked']} |",
        f"| Mediana local in-processo | {stats['median_ms']:.2f} ms |",
        f"| P95 local in-processo | {stats['p95_ms']:.2f} ms |",
        "",
        "## Intenções",
        "",
    ]
    for name, count in stats["intents"].items():
        lines.append(f"- {name}: {count}")
    lines.extend([
        "", "## Limites",
        "",
        "- O conjunto não é holdout de perguntas novas.",
        "- Os estoques são fictícios e não representam quantidades Canon.",
        "- Os tempos excluem rede, navegador e inferência de modelos.",
        "- Busca histórica atual: lexical; não embeddings nem vetores.",
        "- Antes de testar um LLM, criar 20 perguntas novas e separar teste de desenvolvimento.",
        "",
        "## Falhas",
        "",
        ("IDs: " + ", ".join(stats["failures"])) if stats["failures"] else "Nenhuma falha neste conjunto curado.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", nargs="?", default="server/eval/latest-results.json")
    parser.add_argument("--out", default="server/eval/REPORT.md")
    args = parser.parse_args()
    stats = analyze(json.loads(Path(args.source).read_text()))
    Path(args.out).write_text(markdown(stats))
    print(f"Passed {stats['passed']}/{stats['total']}, blocked {stats['blocked']}, abstained {stats['abstained']}")


if __name__ == "__main__":
    main()
