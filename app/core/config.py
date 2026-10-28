import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    spotify_client_id: str = field(default="", repr=False)
    spotify_client_secret: str = field(default="", repr=False)

    @classmethod
    def from_env(cls) -> Settings:
        _ = load_dotenv(Path(__file__).resolve().parents[2] / ".env")
        return cls(
            spotify_client_id=os.getenv("SPOTIFY_CLIENT_ID", ""),
            spotify_client_secret=os.getenv("SPOTIFY_CLIENT_SECRET", ""),
        )
