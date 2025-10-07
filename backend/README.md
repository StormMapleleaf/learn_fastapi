# 数据容器
docker compose up -d

# 数据迁移
alembic revision --autogenerate -m "add users table"
alembic upgrade head
