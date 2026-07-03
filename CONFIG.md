# 鸡蛋缺陷检测系统 - 配置说明

## 一、快速开始

### Windows
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

### Mac / Linux
```bash
chmod +x setup.sh && ./setup.sh
```

---

## 二、常见场景：把项目拷贝给其他人

### 错误做法 ❌
直接把整个项目文件夹（包括 `.venv/`）复制到新电脑。

> 虚拟环境中的路径是硬编码的，换机器后 `pip` 会报错：
> `Fatal error in launcher: Unable to create process using "旧路径\python.exe"`

### 正确做法 ✅

**方式一：用 git 分发（推荐）**
```bash
# 在你的机器上
git init
git add .
git commit -m "init"

# .venv/ 已在 .gitignore 中，不会提交
# 其他人克隆后直接运行 setup.ps1 即可
```

**方式二：直接拷贝文件夹**
```bash
# 1. 把项目文件夹（不含 .venv）拷贝到新电脑
# 2. 在新电脑上运行一键配置
powershell -ExecutionPolicy Bypass -File setup.ps1
```

> setup.ps1 会自动检测到 `.venv` 来自其他电脑，**自动删除并重新创建**。

---

## 三、配置项详解

### 1. AI 对话模型配置

**配置文件**: `common/appConfig.js` → `AI_CONFIG` 对象

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `baseURL` | API 地址（OpenAI / DeepSeek 等兼容接口） | `https://api.deepseek.com/v1` |
| `model` | 模型名称 | `deepseek-chat` |
| `apiKey` | API Key（**建议留空，通过运行时设置**） | `""` |
| `temperature` | 生成温度 0-2 | `0.7` |
| `maxTokens` | 最大生成 Token 数 | `2048` |

**运行时覆盖（不修改代码）**：
```javascript
// 在 UniApp 控制台或页面中执行：
uni.setStorageSync("AI_API_KEY", "sk-your-key-here")
uni.setStorageSync("AI_BASE_URL", "https://api.deepseek.com/v1")
uni.setStorageSync("AI_MODEL", "deepseek-chat")
```

### 2. 检测服务配置

**配置文件**: `common/appConfig.js` → `DETECT_CONFIG` 对象

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `baseURL` | 检测后端服务地址 | `http://localhost:5000` |
| `model` | YOLO 模型文件名 | `best.pt` |
| `conf` | 置信度阈值 | `0.65` |
| `timeout` | 请求超时（毫秒） | `120000` |

**运行时覆盖**：
```javascript
uni.setStorageSync("DETECT_API_URL", "http://192.168.1.100:5000")
```

### 3. 后端服务配置

**配置文件**: `server/.env`（从 `.env.template` 复制后修改）

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `PORT` | 服务端口 | `5000` |
| `EGG_MODEL_PATH` | YOLO 模型路径 | `./models/best.pt` |
| `EGG_CONF` | 默认置信度阈值 | `0.65` |
| `FLASK_DEBUG` | 调试模式 | `true` |

---

## 四、配置优先级

前端配置读取优先级（高 → 低）：
1. `getAIConfig(options)` / `getDetectConfig(options)` 传入的 `options`
2. `uni.getStorageSync("AI_API_KEY")` 等运行时存储
3. `common/appConfig.js` 中的默认值
