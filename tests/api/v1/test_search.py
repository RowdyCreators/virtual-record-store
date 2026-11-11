# tests/api/v1/test_search.py
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

MOCK_SPOTIFY_RESPONSE = [
    {
        "id": "11dFghVXANMlKmJXsNCbNl",
        "type": "track",
        "title": "Hello",
        "artist": "Adele",
        "image_url": "https://i.scdn.co/image/ab67616d0000b273",
        "spotify_uri": "spotify:track:11dFghVXANMlKmJXsNCbNl",
        "spotify_url": "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl"
    }
]

@patch("app.api.v1.search.spotify_service.search_tracks", new_callable=AsyncMock)
def test_search_tracks_success(mock_search):
    mock_search.return_value = MOCK_SPOTIFY_RESPONSE
    response = client.get("/api/search?q=hello&type=track")
    assert response.status_code == 200
    assert response.json() == {"results": MOCK_SPOTIFY_RESPONSE}
    mock_search.assert_awaited_once_with("hello", limit=5)

@patch("app.api.v1.search.spotify_service.search_tracks", new_callable=AsyncMock)
def test_search_tracks_no_matches(mock_search):
    mock_search.return_value = []
    response = client.get("/api/search?q=unknown_song_title")
    assert response.status_code == 200
    assert response.json() == {"results": []}

def test_search_blank_query():
    response = client.get("/api/search?q=   ")
    assert response.status_code == 400
    assert "detail" in response.json()

def test_search_unsupported_type():
    response = client.get("/api/search?q=hello&type=album")
    assert response.status_code == 400
    assert "detail" in response.json()

@patch("app.api.v1.search.spotify_service.search_tracks", new_callable=AsyncMock)
def test_search_spotify_failure(mock_search):
    mock_search.side_effect = RuntimeError("Spotify connection error")
    response = client.get("/api/search?q=hello")
    assert response.status_code == 503
    assert response.json() == {"detail": "Search service temporarily unavailable."}