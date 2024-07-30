# 密码管理器

## 设置环境
创建生产环境配置
```bash
cp config/dev.yml config/prod.yml
```
根据项目实际环境修改配置
```ymal
app:
  # 项目端口号
  port: 8080
# 数据库配置
db:
  mysql:
    # 将数据库地址改为mysql容器名称
    host: 'passwdman-server-db-1'
    username: 'root'
    password: '123456'
    database: 'passwdman-test'
    port: 3306
# jwt 配置
jwt:
  # 过期时间，尽量短，如'5m'
  expiresin: '1h'
# 用户配置
user:
  # 是否开启注册
  enableRegister: true
```
复制Dockerfile到根目录
```bash
cp docker/Dockerfile Dockerfile
```
修改Dockerfile中项目运行端口号，要与上面配置一致
```
# 暴露应用运行的端口（例如 8080）
EXPOSE 8080
```
复制docker-compose.yml到根目录
```bash
cp docker/docker-compose.yml docker-compose.yml
```
修改docker-compose中配置
```
version: '3'
services:
  app:
    build: .
    ports:
      - "8080:8080" #项目端口
    depends_on:
      - db
    volumes:
      - .:/app

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456  #数据库密码
      MYSQL_DATABASE: passwdman-test  #预设数据库库名
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - internal

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    restart: always
    ports:
      - "8081:80"
    environment:
      - PMA_HOST=db
      - PMA_PORT=3306 
      - MYSQL_ROOT_PASSWORD=123456 #数据库密码
    depends_on:
      - db
    networks:
      - internal

volumes:
  db_data:

networks:
  internal:
    driver: bridge
```
## 快速开始
```bash
docker-compose up --build -d
```
