from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World", "status": "FastAPI is working!"}

@app.get("/test")
def test():
    return {"test": "success"}

handler = Mangum(app, lifespan="off")

