from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")


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
