from fastapi import FastAPI, APIRouter, status, HTTPException
from contextlib import asynccontextmanager
import logging
import uvicorn

from config.settings import settings

from services.auth import Auth_Service

#middlewares
from middlewares.setup import setup_middlewares

#error handler setup
from error_handling.setup import setup_error_handlers

#routers
from routers.auth import router as auth_router

#dependencies initiallized at beginning
from infrastructure.jwt import Jwt_Manager

#creating dependencies 
@asynccontextmanager
async def lifespan(app: FastAPI):
    # [Startup]: Triggered before the server starts accepting requests
    logging.basicConfig(level=logging.INFO, filename="job_post_recommendation_system.log", 
                                               format='%(asctime)s - %(levelname)s - %(message)s')

    app.state.jwt_manager = Jwt_Manager()
    app.state.auth_router = Auth_Service()

    yield

    logging.warning("shutting off services")

#app
app = FastAPI(
    title="brightbridge backend",
    lifespan=lifespan,
    description="Asychronous backend that handles requests",
    version="1.0.0"
)

#adding cors middlware
setup_middlewares(app)

#adding error handlers
setup_error_handlers(app)

# app.include_router(auth_router, prefix="/auth")
app.include_router(auth_router)

"""
Function that initially welcomes the user as the are connected to the endpoint.
"""
@app.get("/", status_code=status.HTTP_200_OK)
async def respond():
    response_body = {
        "response" : "you have been connected",
    }
    return response_body

if __name__ == "__main__":
    logging.info("starting services")

    SERVER_IP = settings.SERVER_IP
    SERVER_PORT = settings.SERVER_PORT
    uvicorn.run("app:app", host=SERVER_IP, port=SERVER_PORT, reload=True)