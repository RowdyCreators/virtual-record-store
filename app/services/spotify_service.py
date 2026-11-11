from collections.abc import Callable
from functools import lru_cache
from threading import Lock
from time import monotonic
from typing import Literal, final

import httpx
from pydantic import BaseModel, Field, SecretStr, ValidationError

from app.core.config import Settings


class SpotifyTokenError(Exception):
    """A safe message for token configuration or upstream failures."""


class _TokenResponse(BaseModel):
    access_token: SecretStr = Field(min_length=1)
    token_type: Literal["Bearer", "bearer"]
    expires_in: int = Field(gt=0, strict=True)


@final
class spotify_service:
    """Keep one instance per process to reuse the backend's catalog token."""

    def __init__(
        self, settings: Settings, client: Optional[httpx.AsyncClient] = None, *, clock: Callable[[], float] = monotonic
    ) -> None:
        self.client = client or httpx.AsyncClient()
        self._settings = settings
        self._clock = clock
        self._token = ""
        self._expires_at = 0.0
        self._lock = Lock()

    def get_access_token(self) -> str:
        with self._lock:
            if not (
                self._settings.spotify_client_id
                and self._settings.spotify_client_secret
            ):
                raise SpotifyTokenError("Spotify credentials are not configured.")

            if self._token and self._clock() < self._expires_at:
                return self._token

            requested_at = self._clock()
            try:
                response = httpx.post(
                    "https://accounts.spotify.com/api/token",
                    auth=httpx.BasicAuth(
                        self._settings.spotify_client_id,
                        self._settings.spotify_client_secret,
                    ),
                    data={"grant_type": "client_credentials"},
                    timeout=10.0,
                )
                _ = response.raise_for_status()
                payload = _TokenResponse.model_validate_json(response.content)
            except httpx.HTTPError, ValidationError:
                raise SpotifyTokenError(
                    "Unable to obtain a Spotify access token."
                ) from None

            self._token = payload.access_token.get_secret_value()
            lifetime = payload.expires_in
            self._expires_at = requested_at + lifetime - min(30.0, lifetime / 2)
            return self._token

        async def search_tracks(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
                # Replace with Spotify token retrieval / headers
                headers = await self.get_spotify_service()
                params = {
                    "q": query,
                    "type": "track",
                    "limit": limit
                }
        
                try:
                    response = await self.client.get(
                        "https://api.spotify.com/v1/search",
                        headers=headers,
                        params=params,
                        timeout=5.0
                    )
                    response.raise_for_status()
                    data = response.json()
                except Exception as exc:
                    raise RuntimeError("Spotify upstream failure") from exc
        
                raw_items = data.get("tracks", {}).get("items", [])
                results = []
                for item in raw_items:
                    images = item.get("album", {}).get("images", [])
                    image_url = images[0]["url"] if images else None
                    
                    # Format artists as a single display string
                    artists = ", ".join(a.get("name", "") for a in item.get("artists", []))
        
                    results.append({
                        "id": item.get("id"),
                        "type": item.get("type", "track"),
                        "title": item.get("name"),
                        "artist": artists,
                        "image_url": image_url,
                        "spotify_uri": item.get("uri"),
                        "spotify_url": item.get("external_urls", {}).get("spotify"),
                    })
                return results


@lru_cache(maxsize=1)
def get_spotify_service() -> SpotifyService:
    """Shared backend dependency; never expose its token through a route."""
    return SpotifyService(Settings.from_env())
