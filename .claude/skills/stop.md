---
name: stop
description: 关闭 OtoLuuDiary 项目（后端 + 前端）
---

# 关闭项目

当用户说「关闭项目」「stop」「停止项目」「关掉」时执行。

## 流程

### 1. 查找并关闭后端进程

```bash
netstat -ano | grep 8080
```

找到占用 8080 端口的 PID，然后：

```bash
taskkill //PID <pid> //F
```

### 2. 查找并关闭前端进程

```bash
tasklist | findstr /i "electron"
```

如果有 Electron 进程：

```bash
taskkill //IM electron.exe //F
```

### 3. 确认端口已释放

```bash
netstat -ano | grep 8080
```

如果仍有占用，再次尝试关闭。

### 4. 输出结果

```
✅ 项目已关闭！
   - 后端（端口 8080）已释放
   - 前端 Electron 已终止
```

## 注意

- 使用 `taskkill` 时加 `//F` 强制终止
- 如果找不到进程，说明项目本就没在运行，直接告知用户
