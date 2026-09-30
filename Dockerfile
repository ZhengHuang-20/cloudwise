# 云端智荐：前端（Vite）+ Go 后端的单镜像构建。由服务器上的 `docker compose build` 使用。
# 国内服务器访问 npm / Go 官方源不稳定，默认走镜像源；可用 --build-arg 覆盖。

# ---- 1. 前端构建 ----
FROM node:22-alpine AS web
ARG NPM_REGISTRY=https://registry.npmmirror.com
WORKDIR /app
RUN npm config set registry "$NPM_REGISTRY" && npm install -g bun
COPY package.json bun.lock ./
RUN BUN_CONFIG_REGISTRY="$NPM_REGISTRY" bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- 2. Go 后端构建 ----
FROM golang:1.24-alpine AS api
ARG GOPROXY=https://goproxy.cn,direct
ENV GOPROXY=$GOPROXY CGO_ENABLED=0
WORKDIR /src
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ ./
RUN go build -trimpath -ldflags="-s -w" -o /out/server .

# ---- 3. 运行镜像 ----
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata \
 && adduser -D -u 10001 app \
 && mkdir -p /app/server /state && chown app:app /state
# 工作目录必须是 /app/server：后端默认从 ../dist 托管前端，并读取 ../src/lib/features.ts 的 SHOW_FDE。
WORKDIR /app/server
COPY --from=api /out/server ./server
COPY --from=web /app/dist /app/dist
COPY --from=web /app/src/lib/features.ts /app/src/lib/features.ts
USER app
ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["./server"]
