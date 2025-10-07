from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings
import bcrypt
import hashlib


def pre_hash_password(password: str) -> bytes:
    """先用 SHA-256 对密码进行预哈希，防止 bcrypt 72 字符截断问题"""
    return hashlib.sha256(password.encode('utf-8')).digest()

def verify_password(plain, hashed):
    pre_hashed = pre_hash_password(plain)
    return bcrypt.checkpw(pre_hashed, hashed.encode('utf-8'))

def get_password_hash(password):
    pre_hashed = pre_hash_password(password)
    return bcrypt.hashpw(pre_hashed, bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_bcrypt_sha256_hash(password: str) -> str:
    """用于生成先 SHA-256 再 bcrypt 的密码哈希，方便插入默认用户"""
    import hashlib, bcrypt
    pre_hashed = hashlib.sha256(password.encode('utf-8')).digest()
    return bcrypt.hashpw(pre_hashed, bcrypt.gensalt()).decode('utf-8')
