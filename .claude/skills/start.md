---
name: start
description: 启动 OtoLuuDiary 项目（后端 + 前端）
---

# 启动项目

当用户说「启动项目」「start」「运行项目」时执行。

## 流程

### 1. 检查端口占用

```bash
netstat -ano | grep 8080
```

如果 8080 端口已被占用，提示用户：
```
端口 8080 已被占用，是否要先关闭再启动？使用 /stop 关闭后再启动。
```
停止执行。

### 2. 启动后端

在后台启动 Spring Boot：

```bash
cd e:/Project/OtoLuuDiary/backend
mvn spring-boot:run
```

等待约 20-25 秒，然后验证是否启动成功：

```bash
curl -s http://localhost:8080/api/health
```

如果返回包含 `"backend":"running"`，说明后端启动成功。

### 3. 启动前端

使用 start.bat 启动（解决 ELECTRON_RUN_AS_NODE 环境变量问题）：

```bash
cmd //c "e:/Project/OtoLuuDiary/frontend/start.bat"
```

### 4. 输出结果

```
✅ 项目已启动！
☕ 后端: http://localhost:8080/api
💻 前端: Electron 桌面窗口已打开
📊 健康检查: http://localhost:8080/api/health
```
