from fastapi import APIRouter, HTTPException, Depends, Body, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, insert, update, delete
from app.db import models
from app.db.database import get_db
from app.schemas.film_actor import FilmRead, FilmWithActors, ActorRead, FilmBase

router = APIRouter(prefix="/film", tags=["film"])


@router.get("/list")
def list_films_with_actors(
    page: int = Query(1, ge=1),
    title: str = Query(None, description="电影名模糊搜索"),
    db: Session = Depends(get_db)
):
    limit = 20
    offset = (page - 1) * limit

    film_stmt = (
        select(
            models.film.c.film_id,
            models.film.c.title,
            models.film.c.description
        )
        .order_by(models.film.c.film_id)
        .limit(limit)
        .offset(offset)
    )
    if title:
        film_stmt = film_stmt.where(models.film.c.title.ilike(f"%{title}%"))
    films_result = db.execute(film_stmt).fetchall()
    film_ids = [row.film_id for row in films_result]
    if not film_ids:
        return []

    actor_stmt = (
        select(
            models.film_actor.c.film_id,
            models.actor.c.first_name,
            models.actor.c.last_name
        )
        .select_from(
            models.film_actor.join(
                models.actor,
                models.film_actor.c.actor_id == models.actor.c.actor_id
            )
        )
        .where(models.film_actor.c.film_id.in_(film_ids))
    )
    actor_result = db.execute(actor_stmt).fetchall()

    film_map = {row.film_id: {
        "film_id": row.film_id,
        "title": row.title,
        "description": row.description,
        "actors": []
    } for row in films_result}
    for row in actor_result:
        film_map[row.film_id]["actors"].append(f"{row.first_name} {row.last_name}")

    return list(film_map.values())


# 新增创建电影接口
@router.post("/", response_model=FilmRead)
def create_film(film: FilmBase, db: Session = Depends(get_db)):
    # 设置默认值
    film_data = film.dict()
    
    # 为未提供的字段设置默认值
    if film_data.get('release_year') is None:
        film_data['release_year'] = 2023
    if film_data.get('language_id') is None:
        film_data['language_id'] = 1
    if film_data.get('rental_duration') is None:
        film_data['rental_duration'] = 3
    if film_data.get('rental_rate') is None:
        film_data['rental_rate'] = 2.99
    if film_data.get('replacement_cost') is None:
        film_data['replacement_cost'] = 19.99
    if film_data.get('rating') is None:
        film_data['rating'] = "G"
    if film_data.get('special_features') is None:
        film_data['special_features'] = []
    if film_data.get('fulltext') is None:
        film_data['fulltext'] = ""
    
    film_data['last_update'] = "now()"
    
    stmt = insert(models.film).values(**film_data)
    result = db.execute(stmt)
    db.commit()
    
    # 获取创建的电影信息
    new_film_id = result.inserted_primary_key[0]
    new_film_stmt = select(models.film).where(models.film.c.film_id == new_film_id)
    new_film = db.execute(new_film_stmt).fetchone()
    
    return new_film


# 新增更新电影接口
@router.put("/{film_id}", response_model=FilmRead)
def update_film(film_id: int, film: FilmBase, db: Session = Depends(get_db)):
    # 检查电影是否存在
    existing_film_stmt = select(models.film).where(models.film.c.film_id == film_id)
    existing_film = db.execute(existing_film_stmt).fetchone()
    if not existing_film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    # 更新电影信息
    film_data = film.dict(exclude_unset=True)
    if film_data:
        stmt = update(models.film).where(models.film.c.film_id == film_id).values(**film_data, last_update="now()")
        db.execute(stmt)
        db.commit()
    
    # 获取更新后的电影信息
    updated_film_stmt = select(models.film).where(models.film.c.film_id == film_id)
    updated_film = db.execute(updated_film_stmt).fetchone()
    
    return updated_film