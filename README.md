# FastAPI project template

A small FastAPI starter managed with [uv](https://docs.astral.sh/uv/).

## Work on the project

```bash
just sync       # install dependencies
just dev        # start the development server
just check      # run formatting checks, linting, type checks, and tests
```

The API runs at <http://localhost:8000>. Interactive documentation is at <http://localhost:8000/docs>.

## Project structure

- `app/main.py`: FastAPI application entry point
- `app/api/`: route modules
- `app/core/`: configuration and shared infrastructure
- `app/models/`: application models
- `app/services/`: business logic
- `tests/`: test suite
- `pyproject.toml`: project metadata, dependencies, and tool configuration

## Direct dependencies

Runtime:

- `fastapi[standard]`

Development:

- `pytest`
- `httpx`
- `basedpyright`
- `ruff`

Add project-specific packages with `uv add <package>` or `uv add --dev <package>`.
