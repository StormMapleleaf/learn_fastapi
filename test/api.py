from fastapi import FastAPI, HTTPException
import redis
from fastapi.middleware.cors import CORSMiddleware



# 允许跨域请求
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis 配置
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0

# 连接 Redis
redis_client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

# 初始化座位状态（10 行 10 列，共 100 个座位）
ROW_COUNT = 10
COL_COUNT = 10
SEAT_COUNT = ROW_COUNT * COL_COUNT
BIT_KEY = "Bit:seat"

# 初始化座位状态（全部未售出，Redis 位图默认就是 0，无需重复 setbit）
# 可选：如果需要重置所有座位为未售出，可以加如下代码
# for i in range(SEAT_COUNT):
#     redis_client.setbit(BIT_KEY, i, 0)

LIST_KEY = "List:demo"

@app.get("/seats")
def get_seats():
    """获取所有座位状态，返回二维数组"""
    seats = []
    for row in range(ROW_COUNT):
        row_seats = []
        for col in range(COL_COUNT):
            idx = row * COL_COUNT + col
            status = redis_client.getbit(BIT_KEY, idx)
            row_seats.append("reserved" if status == 1 else "available")
        seats.append(row_seats)
    return {"seats": seats}

@app.post("/reserve/{row}/{col}")
def reserve_seat(row: int, col: int):
    """预订座位"""
    if not (1 <= row <= ROW_COUNT and 1 <= col <= COL_COUNT):
        raise HTTPException(status_code=400, detail="Invalid seat position")
    idx = (row - 1) * COL_COUNT + (col - 1)
    status = redis_client.getbit(BIT_KEY, idx)
    if status == 1:
        raise HTTPException(status_code=400, detail="Seat already reserved")
    redis_client.setbit(BIT_KEY, idx, 1)
    return {"message": f"Seat ({row}, {col}) reserved successfully"}

@app.get("/list")
def get_list():
    """获取列表内容"""
    items = redis_client.lrange(LIST_KEY, 0, -1)
    return {"list": items}

@app.post("/list/lpush")
def lpush_list():
    """左侧推入 1"""
    redis_client.lpush(LIST_KEY, 1)
    return {"message": "lpush 1 success"}

@app.post("/list/rpush")
def rpush_list():
    """右侧推入 1"""
    redis_client.rpush(LIST_KEY, 1)
    return {"message": "rpush 1 success"}

@app.post("/list/lpop")
def lpop_list():
    """左侧弹出"""
    item = redis_client.lpop(LIST_KEY)
    return {"item": item}

@app.post("/list/rpop")
def rpop_list():
    """右侧弹出"""
    item = redis_client.rpop(LIST_KEY)
    return {"item": item}
