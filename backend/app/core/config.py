# app/core/config.py
from pydantic_settings import BaseSettings  # 确保正确导入
from dotenv import load_dotenv
import os

# 加载 .env 文件
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Admin"
    DATABASE_URL: str = (
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int

settings = Settings()
