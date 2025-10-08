# Minimal Frontend (No Build) for FastAPI Backend

本项目是一个**纯静态**前端脚手架（无构建步骤），使用 **原生 HTML/CSS/JS** 与 `fetch` 发起 AJAX 请求，
用于和你的 FastAPI 后端（Uvicorn + Gunicorn）联调，提供：

- 登录页（支持 **Demo** 登录：不依赖后端鉴权，直接进入原型）
- 登录后的“后台框架页”（顶部导航 + 侧边栏 + 内容区）
- 用户模块的 CRUD 原型页（Create / Read / Update / Delete）

> ✅ 无打包、无框架、无 WebAssembly；只需用一个静态文件服务器打开即可。

---

## 1) 启动方式

### A. 最简单（Python 内置静态服）

```bash
# 进入前端目录
cd frontend-minimal

# 启动静态服务（端口可自定，比如 5173）
python -m http.server 5173

# 访问
open http://127.0.0.1:5173/login.html   # macOS
# 或者在浏览器中手动输入
```

### B. 用你熟悉的任意静态服务器（Nginx、serve、http-server 等）
只要指向此目录作为 DocumentRoot 即可。

---

## 2) 后端 CORS（必须配置，否则浏览器会拦截跨域请求）

在 **FastAPI** 端（`app/main.py`）添加 CORS：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="...")

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

然后重启后端。

---

## 3) 配置 API 地址 & 鉴权模式

前端默认的 API 地址是 `http://127.0.0.1:8000`。你可以在 **登录页**里直接设置：

- **API Base URL**：后端基础地址（如 `http://127.0.0.1:8000`）
- **Auth Mode**：`demo`（无后端登录）或 `jwt`（调用后端 `/auth/login` 获取 token）

这些设置会被记录在 `localStorage`，跨页面共享。

---

## 4) 期望的后端接口（可按需裁剪）

- `POST /users`：创建用户 `{ email }` → 返回用户对象
- `GET /users/{id}`：获取用户
- （可选）`GET /users?limit=50&offset=0`：分页列表
- （可选）`PATCH /users/{id}`：更新用户（如 `email`）
- （可选）`DELETE /users/{id}`：删除用户
- （可选）`POST /auth/login`：登录，返回 `{ access_token, token_type }`（token_type 多为 `bearer`）

> 你现在的后端脚手架只有 `POST /users` 与 `GET /users/{id}`，本前端会**优雅降级**：
> - 列表页会尝试 `GET /users`，如果 404/405，则提示“尚未实现列表端点”；
> - 更新/删除同理。这样你可以先跑通“创建+查询”的原型，再逐步补齐后端。

### 参考：快速给后端补上列表/更新/删除（可粘贴到 `app/api/routes/users.py`）

```python
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.db.session import get_session
from app.db.models import User
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserOut])
async def list_users(limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_session)):
    res = await db.execute(select(User).order_by(User.id).limit(limit).offset(offset))
    return res.scalars().all()

@router.patch("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_in: UserCreate, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.email = user_in.email
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_session)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return
```

---

## 5) 页面说明

- **login.html**：登录页，可设置 API 地址与鉴权模式；`demo` 模式不访问后端登录接口。
- **index.html**：登录后的首页（后台典型布局：顶部导航 + 侧边栏 + 内容区）。
- **users.html**：用户 CRUD 原型页：创建、按 ID 查询、（可选）列表、更新、删除。

---

## 6) 提示

- 如果你打算走 **JWT 登录**，请在后端实现 `/auth/login`，返回 `{access_token, token_type}`。
- 如果你使用 **Cookie 会话** 而非 Bearer token，请把 `assets/js/api.js` 里 `Authorization` 相关逻辑去掉，并开启 `credentials: 'include'`。
- 正式项目建议引入更完善的 UI 体系（如 Tailwind 或轻量组件库），但本脚手架刻意避免任何构建依赖，保持最简。

祝编码顺利！
