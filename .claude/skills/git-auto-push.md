---
name: git-auto-push
description: 完成代码修改后，自动生成 commit message 并推送到 GitHub
---

# Git Auto Push

当用户要求「上传 GitHub」「推送到 GitHub」「git push」或完成代码修改后主动触发时，执行以下流程。

## 流程

### 1. 检查 git 状态

```bash
git status
git diff --stat
git log --oneline -5
```

如果没有变更（working tree clean），告知用户「没有需要提交的变更」，结束。

### 2. 暂存所有变更

```bash
git add -A
```

### 3. 自动生成 Commit Message

根据 `git diff --stat` 和 `git diff --cached` 的内容，自动生成符合 **Conventional Commits** 规范的 commit message：

格式：`<type>(<scope>): <description>`

type 选择规则：
- `feat` — 新增功能
- `fix` — 修复 bug
- `refactor` — 重构（不改变功能）
- `docs` — 文档变更
- `style` — 代码格式调整
- `chore` — 构建/配置/依赖变更
- `test` — 测试相关

scope 选择规则：
- `backend` — 后端代码变更
- `frontend` — 前端代码变更
- `config` — 配置文件变更
- `docs` — 文档变更
- 如果变更跨多个模块，省略 scope

description：
- 用中文简要描述变更内容
- 不超过 50 个字符

示例：
- `feat(backend): 添加 Redis Token 认证功能`
- `fix(frontend): 修复日记列表滚动问题`
- `chore(config): 切换配置文件为 yml 格式`

### 4. 提交

```bash
git commit -m "<生成的 commit message>"
```

### 5. 推送到 GitHub

```bash
git push
```

### 6. 失败重试

如果 `git push` 失败：

1. **第一次失败**：等待 3 秒后重试一次
   ```bash
   sleep 3
   git push
   ```

2. **第二次失败**：停止重试，提示用户以下信息：
   ```
   ⚠️ Git Push 失败，已重试 2 次仍未成功。

   可能的原因：
   - 网络连接问题
   - GitHub 认证过期（需要重新登录 gh auth）
   - 远程仓库有冲突（需要先 git pull --rebase）

   请手动检查后重试：
   git pull --rebase
   git push
   ```

### 7. 成功确认

推送成功后，输出：
```
✅ 已成功推送到 GitHub！
📝 Commit: <commit message>
🔗 仓库: <remote url>
```

## 注意事项

- **绝不在没有用户确认的情况下 force push**
- 如果有冲突，提示用户手动解决
- commit message 必须是中文，描述要简洁明了
