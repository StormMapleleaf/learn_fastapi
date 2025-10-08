from fastapi import APIRouter, HTTPException, Depends, Body, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db import models
from app.db.database import get_db
from app.schemas.film_actor import FilmRead, FilmWithActors, ActorRead

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

