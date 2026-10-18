# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

from pathlib import Path

current_dir = Path(__file__).resolve().parent
env_path = current_dir /".env"

class Settings(BaseSettings):
    # Enforce type safety for environment variables
    SERVER_IP: str
    SERVER_PORT: int
    HASH_ALGORITHM: str = "HS256"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Automatically load values from a local .env file
    model_config = SettingsConfigDict(env_file=env_path, env_file_encoding="utf-8")

# Single instantiated source of truth
settings = Settings()