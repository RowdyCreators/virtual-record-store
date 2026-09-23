from typing import cast

from fastapi.testclient import TestClient
from httpx import Response

from app.main import app

client = TestClient(app)


def test_root() -> None:
    response = cast(Response, client.get("/"))  # pyright: ignore[reportUnknownMemberType]

    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
