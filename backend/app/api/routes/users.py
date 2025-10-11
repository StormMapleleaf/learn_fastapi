from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from app.schemas.user import  UserCreate
from app.db import models
from app.db.database import get_db, redis_client
from app.core.security import get_password_hash
import json
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register")
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash("admin")
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}

@router.get("/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email}

def serialize_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at.isoformat() if isinstance(user.created_at, datetime) else user.created_at
    }

@router.get("/")
async def list_users(limit: int = 50, db: Session = Depends(get_db)):
    cache_key = f"users:limit:{limit}"
    cached_users = redis_client.get(cache_key)
    if cached_users:
        print("从缓存中获取数据")
        print(cached_users)
        return json.loads(cached_users)

    users = db.query(models.User).filter(models.User.is_active == True).order_by(models.User.id).limit(limit).all()
    user_list = [serialize_user(u) for u in users]
    redis_client.set(cache_key, json.dumps(user_list), ex=30)
    print("写入缓存")
    print(redis_client.get(cache_key))
    return user_list

@router.post("/delete/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="用户已经删除")
    user.is_active = False
    db.commit()
    return {"detail": "成功删除用户"}

@router.post("/update/{user_id}")
async def update_user(user_id: int, email: str = Body(..., embed=True), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="用户已被删除")
    existing_user = db.query(models.User).filter(models.User.email == email, models.User.id != user_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="邮箱已被占用")
    user.email = email
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email}


