# ============================================
# 鸡蛋缺陷检测系统 - 一键配置脚本 (Windows)
# ============================================
# 用法: powershell -ExecutionPolicy Bypass -File setup.ps1
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   鸡蛋缺陷检测系统 - 环境配置向导          " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ==================== 1. Python 虚拟环境 ====================
Write-Host "[1/5] Python 虚拟环境" -ForegroundColor Yellow
$venvPath = Join-Path $PSScriptRoot ".venv"
$needRecreate = $false

if (Test-Path $venvPath) {
    $cfgFile = Join-Path $venvPath "pyvenv.cfg"
    if (Test-Path $cfgFile) {
        $content = Get-Content $cfgFile -Raw
        if ($content -match "home\s*=\s*(.+)") {
            $origPythonHome = $matches[1].Trim()
            $currentPython = (Get-Command python -ErrorAction SilentlyContinue).Source
            if (-not $currentPython) {
                Write-Host "  [ERR] 未找到 python，请先安装 Python 3.9+" -ForegroundColor Red
                exit 1
            }
            $currentPythonDir = Split-Path $currentPython -Parent
            if ($origPythonHome -ne $currentPythonDir) {
                Write-Host "  [WARN] 检测到虚拟环境来自其他电脑 (旧路径: $origPythonHome)" -ForegroundColor Yellow
                Write-Host "  -> 正在删除旧的虚拟环境并重新创建..." -ForegroundColor Gray
                Remove-Item -Path $venvPath -Recurse -Force
                $needRecreate = $true
            }
        }
    }
} else {
    $needRecreate = $true
}

if ($needRecreate) {
    Write-Host "  -> 正在创建 Python 虚拟环境..." -ForegroundColor Gray
    python -m venv $venvPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERR] 创建虚拟环境失败，请确保已安装 Python 3.9+" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] 虚拟环境已创建: $venvPath" -ForegroundColor Green
} else {
    Write-Host "  [OK] 虚拟环境已存在且路径正确，跳过" -ForegroundColor Green
}

# 安装依赖
Write-Host "  -> 正在安装 Python 依赖..." -ForegroundColor Gray
$pipPath = Join-Path $venvPath "Scripts\pip.exe"
$reqFile = Join-Path $PSScriptRoot "server\requirements.txt"

# 先尝试用 --prefer-binary 避免编译 C 扩展
Write-Host "  -> 尝试安装预编译包..." -ForegroundColor Gray
& $pipPath install --prefer-binary -r $reqFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] 预编译安装失败，尝试从源码编译..." -ForegroundColor Yellow
    Write-Host "  [i] 如果持续失败，可能是因为 Python 版本太新导致部分包没有预编译版本" -ForegroundColor Gray
    Write-Host "  [i] 解决方案:" -ForegroundColor Gray
    Write-Host "  [i]   1. 安装 Python 3.12 (推荐，兼容性最好)" -ForegroundColor Gray
    Write-Host "  [i]   2. 安装 VS Build Tools: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Gray
    & $pipPath install -r $reqFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERR] 依赖安装失败，请按上述提示操作" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  [OK] Python 依赖安装完成" -ForegroundColor Green

# ==================== 2. 后端配置 (.env) ====================
Write-Host "[2/5] 后端环境配置" -ForegroundColor Yellow
$envFile = Join-Path $PSScriptRoot "server\.env"
$envTemplate = Join-Path $PSScriptRoot "server\.env.template"
if (-not (Test-Path $envFile)) {
    Copy-Item $envTemplate $envFile
    Write-Host "  [OK] 已创建 .env 文件 (从 .env.template)" -ForegroundColor Green
} else {
    Write-Host "  [OK] .env 文件已存在，跳过" -ForegroundColor Green
}

# ==================== 3. AI 配置交互 ====================
Write-Host "[3/5] AI 对话配置" -ForegroundColor Yellow
$configFile = Join-Path $PSScriptRoot "common\appConfig.js"
Write-Host "  [i] 如需配置 AI 模型，编辑 common/appConfig.js 或在运行时设置" -ForegroundColor Gray

$input = Read-Host "  [?] 是否要配置 AI API Key？(y/n，默认 n)"
if ($input -eq 'y' -or $input -eq 'Y') {
    $apiKey = Read-Host "  请输入 API Key (sk-xxx)"
    $model = Read-Host "  请输入模型名称 (默认: deepseek-chat)"
    $baseUrl = Read-Host "  请输入 API 地址 (默认: https://api.deepseek.com/v1)"

    if (-not $model) { $model = "deepseek-chat" }
    if (-not $baseUrl) { $baseUrl = "https://api.deepseek.com/v1" }

    $content = Get-Content $configFile -Raw
    $content = $content -replace "(apiKey:\s*)'.*'", "`$1'$apiKey'"
    $content = $content -replace "(baseURL:\s*)'[^']*'", "`$1'$baseUrl'"
    $content = $content -replace "(model:\s*)'[^']*'", "`$1'$model'"
    Set-Content $configFile -Value $content
    Write-Host "  [OK] AI 配置已更新" -ForegroundColor Green
}

# ==================== 4. 检测服务配置 ====================
Write-Host "[4/5] 检测服务配置" -ForegroundColor Yellow
$input = Read-Host "  [?] 是否要配置检测服务地址？(y/n，默认 n)"
if ($input -eq 'y' -or $input -eq 'Y') {
    $detectUrl = Read-Host "  请输入检测服务地址 (默认: http://localhost:5000)"
    if (-not $detectUrl) { $detectUrl = "http://localhost:5000" }

    $content = Get-Content $configFile -Raw
    $content = $content -replace "(baseURL:\s*)'[^']*'", "`$1'$detectUrl'"
    Set-Content $configFile -Value $content
    Write-Host "  [OK] 检测服务地址已更新" -ForegroundColor Green
}

$modelPath = Join-Path $PSScriptRoot "server\models\best.pt"
if (Test-Path $modelPath) {
    Write-Host "  [OK] YOLO 模型文件存在: server/models/best.pt" -ForegroundColor Green
} else {
    Write-Host "  [WARN] YOLO 模型文件不存在，请将 best.pt 放到 server/models/ 目录" -ForegroundColor Yellow
}

# ==================== 5. 完成 ====================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   配置完成！                                " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  启动后端服务:" -ForegroundColor White
Write-Host "    cd server" -ForegroundColor Gray
Write-Host "    ..\.venv\Scripts\activate" -ForegroundColor Gray
Write-Host "    python app.py" -ForegroundColor Gray
Write-Host ""
Write-Host "  提示: 如果拷贝项目到新电脑，只需再次运行本脚本即可" -ForegroundColor Yellow
Write-Host ""
