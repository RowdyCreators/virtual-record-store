import httpx
import pytest

from app.core.config import Settings
from app.services.spotify_service import SpotifyService, SpotifyTokenError


def test_obtains_reuses_and_renews_token(monkeypatch: pytest.MonkeyPatch) -> None:
    requests: list[httpx.Request] = []
    now = [100.0]

    def respond(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        assert request.url == "https://accounts.spotify.com/api/token"
        assert request.method == "POST"
        assert request.headers["authorization"] == "Basic Y2xpZW50OnNlY3JldA=="
        assert request.content == b"grant_type=client_credentials"
        return httpx.Response(
            200,
            json={
                "access_token": f"token-{len(requests)}",
                "token_type": "Bearer",
                "expires_in": 3600,
            },
        )

    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        monkeypatch.setattr(httpx, "post", client.post)
        service = SpotifyService(Settings("client", "secret"), clock=lambda: now[0])
        assert service.get_access_token() == "token-1"
        now[0] = 200.0
        assert service.get_access_token() == "token-1"
        assert len(requests) == 1
        now[0] = 3700.0
        assert service.get_access_token() == "token-2"
        assert len(requests) == 2


def test_missing_credentials_fail_without_a_request(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def unexpected_request(*_args: object, **_kwargs: object) -> httpx.Response:
        pytest.fail("Missing credentials must not be sent to Spotify")

    monkeypatch.setattr(httpx, "post", unexpected_request)
    for settings in (Settings(), Settings("client", ""), Settings("", "secret")):
        with pytest.raises(SpotifyTokenError, match="not configured"):
            _ = SpotifyService(settings).get_access_token()


def test_spotify_failures_are_safe_and_can_be_retried(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    failures = [
        httpx.Response(401, json={"error": "private-upstream-details"}),
        httpx.Response(429, text="private-upstream-details"),
        httpx.Response(503, text="private-upstream-details"),
        httpx.Response(200, text="not JSON: private-upstream-details"),
        httpx.Response(200, json={"access_token": "private-upstream-details"}),
        httpx.Response(
            200,
            json={"access_token": "", "token_type": "Bearer", "expires_in": 0},
        ),
        httpx.ConnectTimeout("private-upstream-details"),
    ]
    for failure in failures:
        calls = 0

        def respond(
            _request: httpx.Request,
            failure: httpx.Response | httpx.ConnectTimeout = failure,
        ) -> httpx.Response:
            nonlocal calls
            calls += 1
            if calls == 1:
                if isinstance(failure, httpx.HTTPError):
                    raise failure
                return failure
            return httpx.Response(
                200,
                json={
                    "access_token": "recovered",
                    "token_type": "Bearer",
                    "expires_in": 3600,
                },
            )

        with httpx.Client(transport=httpx.MockTransport(respond)) as client:
            monkeypatch.setattr(httpx, "post", client.post)
            service = SpotifyService(Settings("client", "secret"))
            with pytest.raises(SpotifyTokenError) as error:
                _ = service.get_access_token()
            assert str(error.value) == "Unable to obtain a Spotify access token."
            assert error.value.__suppress_context__
            assert service.get_access_token() == "recovered"
