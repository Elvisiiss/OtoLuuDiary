---
name: restart
description: 重启 OtoLuuDiary 项目（先关闭再启动）
---

# 重启项目

当用户说「重启项目」「restart」「重新启动」时执行。

## 流程

### 1. 关闭项目

```bash
# 查找并关闭后端
netstat -ano | grep 8080
taskkill //PID <pid> //F

# 关闭前端
taskkill //IM electron.exe //F
```

等待 3 秒确保进程完全退出：

```bash
sleep 3
```

### 2. 启动项目

```bash
# 启动后端
cd e:/Project/OtoLuuDiary/backend
mvn spring-boot:run
```

等待 25 秒后验证：

```bash
curl -s http://localhost:8080/api/health
```

确认成功后启动前端：

```bash
cmd //c "e:/Project/OtoLuuDiary/frontend/start.bat"
```

### 3. 输出结果

```
✅ 项目已重启！
☕ 后端: http://localhost:8080/api
💻 前端: Electron 桌面窗口已打开
```
