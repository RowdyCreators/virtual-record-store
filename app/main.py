from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
APP_DIR = Path(__file__).parent
app.mount("/static", StaticFiles(directory=APP_DIR / "static"), name="static")
templates = Jinja2Templates(directory=APP_DIR / "templates")


@app.get("/")
def main(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={},
    )


@app.get("/api/test")
def get_test() -> dict[str, str]:
    return {"message": "Hello from GET!"}


@app.post("/api/greet")
def greet(name: str) -> dict[str, str]:
    return {"message": f"Hello, {name}!"}
