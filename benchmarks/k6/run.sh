#!/usr/bin/env bash
# Executa o script de carga k6 e grava métricas em JSON:
# benchmarks/k6/results/<nome-do-repo>-<AAAA-MM-DD>.json
# Se esse arquivo já existir no mesmo dia, usa sufixo -HHMMSS para não sobrescrever.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if command -v git >/dev/null 2>&1 && git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  REPO="$(basename "$(git -C "$ROOT" rev-parse --show-toplevel)")"
else
  REPO="$(basename "$ROOT")"
fi

DATE="$(date +%Y-%m-%d)"
RESULTS_DIR="${K6_RESULTS_DIR:-benchmarks/k6/results}"
mkdir -p "$RESULTS_DIR"

CANDIDATE="$RESULTS_DIR/${REPO}-${DATE}.json"
if [[ -f "$CANDIDATE" ]]; then
  OUT="$RESULTS_DIR/${REPO}-${DATE}-$(date +%H%M%S).json"
else
  OUT="$CANDIDATE"
fi

echo "k6: saída JSON -> $OUT" >&2
exec k6 run --out "json=$OUT" "$@" benchmarks/k6/aluno-load-auth.js
