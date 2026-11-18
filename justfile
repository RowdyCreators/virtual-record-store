# List available recipes
default:
    @just --list
# Frontend-only throwaway prototype (no FastAPI or credentials)
prototype:
    python3 -m http.server 8010 --bind 127.0.0.1 --directory app
# Install dependencies
sync:
    uv sync
# Run fastapi in development mode
dev:
    uv run fastapi dev
# Run fastapi in production mode
prod:
    uv run fastapi run
# Run the test suite
test:
    uv run python -m pytest
# Format code with ruff
format:
    uv run ruff format .
# Check linting rules
lint:
    uv run ruff check .
# Apply safe lint fixes
lint-fix:
    uv run ruff check --fix .
# Run static type checking
typecheck:
    uv run basedpyright
# Check formatting, linting, typechecks, and test suite
check: lint typecheck test
    uv run ruff format --check .
    echo "All checks passed!"
