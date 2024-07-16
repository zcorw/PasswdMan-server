# 使用官方的 Node.js 镜像
FROM node:20

# 创建并设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果有）
COPY package*.json ./
COPY yarn.lock ./

# 安装项目依赖
RUN yarn

# 复制项目文件
COPY . .

# 构建 NestJS 应用
RUN yarn build

# 暴露应用运行的端口（例如 8080）
EXPOSE 8080

# 启动应用
CMD ["npm", "run", "start:prod"]
