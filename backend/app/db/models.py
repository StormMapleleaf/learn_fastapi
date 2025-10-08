# app/db/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime,Table,MetaData, Numeric, ForeignKey
from datetime import datetime, timezone
from app.db.database import Base

metadata = MetaData()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

film = Table(
    'film', metadata,
    Column('film_id', Integer, primary_key=True),
    Column('title', String(255), nullable=False),
    Column('description', String),
    Column('release_year', Integer),
    Column('language_id', Integer, nullable=False),
    Column('rental_duration', Integer, nullable=False, ),
    Column('rental_rate', Numeric(5, 2), nullable=False),
    Column('length', Integer),
    Column('replacement_cost', Numeric(5, 2), nullable=False),
    Column('rating', String(10)),
    Column('last_update', DateTime, nullable=False),
    Column('special_features', String),
    Column('fulltext', String),
)

actor = Table(
    'actor', metadata,
    Column('actor_id', Integer, primary_key=True),
    Column('first_name', String(45), nullable=False),
    Column('last_name', String(45), nullable=False),
    Column('last_update', DateTime, nullable=False),
)

film_actor = Table(
    'film_actor', metadata,
    Column('actor_id', Integer, ForeignKey('actor.actor_id'), primary_key=True),
    Column('film_id', Integer, ForeignKey('film.film_id'), primary_key=True),
    Column('last_update', DateTime, nullable=False),
)