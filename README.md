# Virtual Record Store

A FastAPI starting point for a virtual record store. The repository currently contains a server-rendered root page and placeholders for the API, models, services, and database code. Record browsing, accounts, and persistence are not implemented yet.

## Getting started

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) and [just](https://just.systems/man/en/packages.html).

```bash
git clone https://github.com/RowdyCreators/virtual-record-store.git
cd virtual-record-store
just sync
just dev
```

Open <http://localhost:8000/> to see the current page. FastAPI's interactive API documentation is at <http://localhost:8000/docs>.

For development, run `just dev` or `uv run fastapi dev`. For production, run `just prod` or `uv run fastapi run`.

### Python with uv

The project requires Python 3.14 or newer. `just sync` runs `uv sync`, which downloads a compatible Python version if needed and installs the dependencies in `.venv`. If you prefer to install Python through uv first, run `uv python install 3.14` before `just sync`.

## Development

| Command | Purpose |
| --- | --- |
| `just test` | Run pytest (currently exits with code 5 because no tests exist yet) |
| `just lint` | Check code with Ruff |
| `just format` | Format code with Ruff |
| `just typecheck` | Run basedpyright |
| `just check` | Run lint, type checking, tests, and a formatting check |

Dependencies are managed in `pyproject.toml` and locked in `uv.lock`. Add runtime packages with `uv add <package>` or development tools with `uv add --dev <package>`. CI runs formatting, lint, tests, and type checks on pushes and pull requests to `main`. Until tests are added, `just check` and CI also fail at the test step.

## Project layout

```text
app/
  main.py              FastAPI app and root route
  templates/index.html Empty HTML page returned at /
  api/v1/user.py       Placeholder for user routes
  core/                Placeholders for configuration and logging
  db/schema.py         Placeholder for database schema
  models/user.py       Placeholder for user models
  services/user_service.py  Placeholder for user logic
tests/                 Empty test placeholders
justfile               Development commands
pyproject.toml         Python requirements and dependencies
```
