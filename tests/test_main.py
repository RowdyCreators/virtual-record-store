from typing import cast

from fastapi.testclient import TestClient
from httpx import Response

from app.main import app

client = TestClient(app)


def test_get() -> None:
    response = cast(Response, client.get("/api/test"))  # pyright: ignore[reportUnknownMemberType]
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from GET!"}


def test_post() -> None:
    response = cast(Response, client.post("/api/greet", params={"name": "Ada"}))  # pyright: ignore[reportUnknownMemberType]
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, Ada!"}
