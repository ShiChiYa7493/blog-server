# blog-server

[shichiya-blog](https://github.com/ShiChiYa7493/shichiya-blog) 的 NestJS 10 后端，也是该仓库的子模块 `packages/server`。通过 Prisma 6 访问 PostgreSQL，为前台、后台、上传和 RSS 提供 `/api` 接口。

## 模块

- `article`：文章发布、分页、分类 / 标签筛选、全文搜索，阅读量按 IP 每日去重。
- `auth`：管理员登录、JWT 校验和资料更新。
- `category`、`tag`：分类与标签。
- `comment`：树形回复和后台审核。新评论当前默认通过。
- `gallery`、`gallery-category`：相册图片和分类。
- `upload`：管理员头像及文章图片。
- `stats`：后台统计和 RSS。

作为博客子模块运行时，上传文件写到博客仓库根目录的 `uploads/`。头像和文章图片单文件上限 5 MB，相册图片上限 10 MB。

## 配置

```bash
npm install
cp .env.example .env
```

| 变量 | 用途 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `JWT_SECRET` | JWT 签名密钥 |
| `SITE_URL` | RSS 使用的公开站点地址 |
| `HOST` / `PORT` | 监听地址和端口，生产环境为 `127.0.0.1:3001` |
| `NODE_ENV` | 运行环境 |

## 数据库

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

在博客仓库里，迁移命令是 `npm run db:migrate`。Seed 默认账号是 `admin` / `admin123`，首次登录后要马上改密码。

## 开发与构建

```bash
npm run start:dev
npm run build
npm run start:prod
```

在博客仓库里对应 `npm run dev:server` 和 `npm run build:server`。API 默认是 `http://127.0.0.1:3001/api`。生产环境由 PM2 进程 `blog-api` 运行，Nginx 代理 `/api/`。

整站部署见 [shichiya-blog](https://github.com/ShiChiYa7493/shichiya-blog)。这个仓库不负责前端页面，也不负责 Warframe 机器人。
