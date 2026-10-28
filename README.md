# Virtual Record Store

A FastAPI starting point for a virtual record store. The repository contains a server-rendered root page, two example API routes, and a backend Spotify token service. Record browsing, accounts, and persistence are not implemented yet.

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

## Spotify credentials

The backend uses Spotify's [Client Credentials flow](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow) to read catalog data. This authenticates the app, not a visitor: it does not provide personal playlists, accounts, or playback. Spotify currently requires the owner of a development-mode app to have Premium.

1. Create or open an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and find its client ID and client secret in the app settings. This flow does not use a redirect URI.
2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Fill in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env`, then restart the server. Existing environment variables take precedence over `.env` values. Keep `.env` local: Git ignores it. Never put secrets or access tokens in frontend code, logs, or commits.

You do not need to obtain or save a token manually. `Settings.from_env()` in `app/core/config.py` reads the credentials. `get_spotify_service()` in `app/services/spotify_service.py` provides a shared service whose `get_access_token()` method exchanges them for a temporary token. It caches the token in memory per server process, renews it slightly before expiry, and serializes concurrent refreshes. Restarting the process clears the cache. This flow obtains a new token rather than using a refresh token.

The service is synchronous; use it from synchronous backend routes (or a worker thread), not directly on an async event loop. There is no public token route. Missing credentials and upstream failures raise `SpotifyTokenError` with a safe message; callers should not log request headers or upstream response bodies.

### Local catalog smoke check

After setting your credentials, run this from the repository root. It obtains a token and requests an album without printing credentials or the token. This is a manual check, not part of the mocked test suite.

```bash
uv run python - <<'PY'
import httpx

from app.services.spotify_service import SpotifyTokenError, get_spotify_service

try:
    token = get_spotify_service().get_access_token()
except SpotifyTokenError as error:
    raise SystemExit(str(error)) from None

try:
    response = httpx.get(
        "https://api.spotify.com/v1/albums/4aawyAB9vmqN3uQ7FjRGTy",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )
except httpx.HTTPError:
    raise SystemExit("Spotify catalog request failed.") from None

if response.status_code != 200:
    raise SystemExit(f"Spotify catalog request returned HTTP {response.status_code}.")
print("Spotify catalog access works:", response.json()["name"])
PY
```

## Development

| Command | Purpose |
| --- | --- |
| `just test` | Run pytest |
| `just lint` | Check code with Ruff |
| `just format` | Format code with Ruff |
| `just typecheck` | Run basedpyright |
| `just check` | Run lint, type checking, tests, and a formatting check |

Dependencies are managed in `pyproject.toml` and locked in `uv.lock`. Add runtime packages with `uv add <package>` or development tools with `uv add --dev <package>`. CI runs formatting, lint, tests, and type checks on pushes and pull requests to `main`.

## Project layout

```text
app/
  main.py              FastAPI app, root route, and example API routes
  templates/index.html Empty HTML page returned at /
  api/v1/user.py       Placeholder for user routes
  core/config.py       Spotify credentials loaded from environment or .env
  core/logging.py      Placeholder for logging
  db/schema.py         Placeholder for database schema
  models/user.py       Placeholder for user models
  services/user_service.py  Placeholder for user logic
  services/spotify_service.py  Cached server-side Spotify access tokens
tests/                 API and mocked Spotify token tests
.env.example           Local credential variable names (no secrets)
justfile               Development commands
pyproject.toml         Python requirements and dependencies
pyrightconfig.json    Basedpyright virtual environment settings
```
