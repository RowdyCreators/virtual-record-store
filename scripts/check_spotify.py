"""Check live Spotify token access without printing credentials or tokens."""

import sys
from pathlib import Path

# Allow direct execution from scripts/ without installing the app as a package.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.spotify_service import (
    SpotifyTokenError,
    get_spotify_service,
)


def main() -> int:
    try:
        service = get_spotify_service()
        token = service.get_access_token()
        print("Token obtained:", bool(token))
        print("Same token returned:", service.get_access_token() == token)
    except SpotifyTokenError as error:
        print(error, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
