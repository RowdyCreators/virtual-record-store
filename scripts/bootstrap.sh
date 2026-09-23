#!/usr/bin/env bash
set -euo pipefail

if ! command -v uv >/dev/null 2>&1; then
    echo "Error: uv is required. Install it from https://docs.astral.sh/uv/." >&2
    exit 1
fi

project_name="${1:-$(basename "$PWD")}"

if [[ ! "$project_name" =~ ^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*$ ]]; then
    echo "Error: '$project_name' is not a valid Python project name." >&2
    echo "Use letters, numbers, dots, underscores, or hyphens." >&2
    exit 1
fi

if [[ ! -f pyproject.toml || ! -f README.md ]]; then
    echo "Error: run this script from the repository root." >&2
    exit 1
fi

uv run --no-project python - "$project_name" <<'PY'
from pathlib import Path
import sys

project_name = sys.argv[1]
pyproject_path = Path("pyproject.toml")
lines = pyproject_path.read_text().splitlines(keepends=True)

in_project = False
replaced = False
for index, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith("["):
        in_project = stripped == "[project]"
    elif in_project and stripped.startswith("name ="):
        newline = "\n" if line.endswith("\n") else ""
        lines[index] = f'name = "{project_name}"{newline}'
        replaced = True
        break

if not replaced:
    raise SystemExit("Error: pyproject.toml has no [project] name field.")

pyproject_path.write_text("".join(lines))

readme_path = Path("README.md")
readme_lines = readme_path.read_text().splitlines(keepends=True)
if readme_lines and readme_lines[0].startswith("# "):
    newline = "\n" if readme_lines[0].endswith("\n") else ""
    readme_lines[0] = f"# {project_name}{newline}"
    readme_path.write_text("".join(readme_lines))
PY

# Re-resolve direct dependencies so a new project starts on current releases.
uv add --upgrade "fastapi[standard]"
uv add --dev --upgrade pytest httpx basedpyright ruff

echo
echo "Bootstrapped '$project_name'."
echo "Run 'just check' to verify the project and 'just dev' to start the API."
