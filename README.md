# 博客 API

`packages/server` 是 shichiya-blog 的 NestJS 10 后端。它通过 Prisma 6 访问 PostgreSQL，为博客前台、后台管理、图片上传和 RSS 提供 `/api` 接口。

## 模块

- `article`：文章发布、分页、分类 / 标签筛选、全文搜索和按 IP 每日阅读量去重。
- `auth`：管理员登录、JWT 校验和资料更新。
- `category`、`tag`：分类与标签管理。
- `comment`：树形回复、状态管理和后台审核接口；新评论当前默认通过。
- `gallery`、`gallery-category`：相册图片和分类管理。
- `upload`：管理员头像及文章图片上传。
- `stats`：后台统计和 RSS 输出。

上传文件写入仓库根目录的 `uploads/`。头像 / 文章图片单文件上限为 5 MB，相册图片上限为 10 MB。

## 配置

```bash
cp packages/server/.env.example packages/server/.env
```

| 变量 | 用途 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `JWT_SECRET` | JWT 签名密钥 |
| `SITE_URL` | RSS 中使用的公开站点地址 |
| `HOST` / `PORT` | 监听地址和端口，生产环境为 `127.0.0.1:3001` |
| `NODE_ENV` | 运行环境 |

## 数据库

首次安装或发布迁移：

```bash
npm run db:migrate
```

首次创建管理员：

```bash
npx -w packages/server prisma db seed
```

Seed 默认账号为 `admin` / `admin123`，首次登录后必须立即修改密码。

## 开发与构建

从仓库根目录执行：

```bash
npm run dev:server
npm run build:server
```

API 默认监听 `http://127.0.0.1:3001/api`。生产环境由 PM2 以 `blog-api` 运行，并由 Nginx 代理 `/api/`；完整部署步骤见[仓库 README](../../README.md)。
