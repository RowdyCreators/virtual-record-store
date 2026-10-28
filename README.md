# Virtual Record Store

A virtual record store built with FastAPI, Jinja2, and plain JavaScript. The app has a search input, example API routes, and a server-side Spotify token service. Catalog search, accounts, playback, and persistence are not implemented.

## Getting started

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) and [just](https://just.systems/man/en/packages.html). The project requires Python 3.14+; uv installs a compatible version if needed.

```bash
git clone https://github.com/RowdyCreators/virtual-record-store.git
cd virtual-record-store
just sync
just dev
```

Open <http://localhost:8000/> to see the current page. FastAPI's interactive API documentation is at <http://localhost:8000/docs>.

The page and mocked tests work without Spotify credentials.

## Spotify credentials

To enable backend catalog access:

1. Open your app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard). Development-mode app owners need Spotify Premium.
2. Copy `.env.example` to `.env`.
3. Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` using the values in your app settings, then restart the server. Environment variables take precedence over `.env`.

Run `uv run scripts/check_spotify.py` from the project root to check token retrieval and reuse without printing the token. Failures exit with code 1.

The token service uses [Client Credentials](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow): it authenticates the backend, caches a temporary token, and renews it before expiry. No manual token setup, visitor login, or redirect URI is needed. Search routes are not connected yet.

> [!IMPORTANT]
> `.env` is ignored by Git. Keep credentials and access tokens out of frontend code, logs, and commits.

## Development

| Command | Purpose |
| --- | --- |
| `just dev` | Start the development server with auto-reload |
| `just prod` | Start the server without auto-reload |
| `just test` | Run pytest |
| `just lint` | Check code with Ruff |
| `just format` | Format code with Ruff |
| `just typecheck` | Run basedpyright |
| `just check` | Run lint, type checking, tests, and a formatting check |

Manage dependencies with `uv add <package>` or `uv add --dev <package>`. CI runs the same checks on pushes and pull requests to `main`. Spotify tests use mocked responses and require no credentials.

## Project layout

- [`app/main.py`](app/main.py): FastAPI app and routes.
- `app/templates/` and `app/static/`: page templates, JavaScript, and CSS.
- [`app/core/config.py`](app/core/config.py): environment configuration.
- [`app/services/spotify_service.py`](app/services/spotify_service.py): token requests and caching.
- `app/api/`, `app/models/`, and `app/db/`: placeholders for routes, models, and persistence.
- [`tests/`](tests/): API and token service tests.
