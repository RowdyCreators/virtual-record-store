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
class SpotifyService:
    """Keep one instance per process to reuse the backend's catalog token."""

    def __init__(
        self, settings: Settings, *, clock: Callable[[], float] = monotonic
    ) -> None:
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


@lru_cache(maxsize=1)
def get_spotify_service() -> SpotifyService:
    """Shared backend dependency; never expose its token through a route."""
    return SpotifyService(Settings.from_env())
