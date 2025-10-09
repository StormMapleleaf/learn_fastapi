from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FilmBase(BaseModel):
    title: str
    description: Optional[str] = None
    release_year: Optional[int] = 2023
    language_id: Optional[int] = 1
    rental_duration: Optional[int] = 3
    rental_rate: Optional[float] = 2.99
    length: Optional[int] = 0
    replacement_cost: Optional[float] = 19.99
    rating: Optional[str] = "G"
    special_features: Optional[List[str]] = []

# 电影读取模型
class FilmRead(FilmBase):
    film_id: int
    last_update: datetime
    fulltext: Optional[str] = None

    class Config:
        orm_mode = True

# 演员基础模型
class ActorBase(BaseModel):
    first_name: str
    last_name: str

# 演员读取模型
class ActorRead(ActorBase):
    actor_id: int
    last_update: datetime

    class Config:
        orm_mode = True

# 电影包含演员的模型
class FilmWithActors(FilmRead):
    actors: List[ActorRead] = []



