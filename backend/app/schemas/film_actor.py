from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FilmBase(BaseModel):
    title: str
    description: Optional[str] = None
    release_year: Optional[int] = None
    language_id: int
    rental_duration: int
    rental_rate: float
    length: Optional[int] = None
    replacement_cost: float
    rating: Optional[str] = None
    special_features: Optional[str] = None

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



