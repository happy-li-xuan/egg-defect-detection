#!/bin/bash
# ============================================
# 鸡蛋缺陷检测系统 - 一键配置脚本 (Mac / Linux)
# ============================================
# 用法: chmod +x setup.sh && ./setup.sh
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   鸡蛋缺陷检测系统 - 环境配置向导${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ==================== 1. Python 虚拟环境 ====================
echo -e "${YELLOW}[1/5] Python 虚拟环境${NC}"
VENV_PATH="$SCRIPT_DIR/.venv"
NEED_RECREATE=false

if [ -d "$VENV_PATH" ]; then
    CFG_FILE="$VENV_PATH/pyvenv.cfg"
    if [ -f "$CFG_FILE" ]; then
        ORIG_PYTHON_HOME=$(grep "^home\s*=" "$CFG_FILE" | sed 's/.*= //')
        CURRENT_PYTHON=$(which python3 2>/dev/null || which python 2>/dev/null || echo "")
        if [ -n "$CURRENT_PYTHON" ]; then
            CURRENT_PYTHON_DIR=$(dirname "$(readlink -f "$CURRENT_PYTHON" 2>/dev/null || echo "$CURRENT_PYTHON")")
            if [ "$ORIG_PYTHON_HOME" != "$CURRENT_PYTHON_DIR" ]; then
                echo -e "  ${YELLOW}[WARN] 检测到虚拟环境来自其他电脑 (旧路径: $ORIG_PYTHON_HOME)${NC}"
                echo -e "  ${GRAY}-> 正在删除旧的虚拟环境并重新创建...${NC}"
                rm -rf "$VENV_PATH"
                NEED_RECREATE=true
            fi
        fi
    fi
else
    NEED_RECREATE=true
fi

if [ "$NEED_RECREATE" = true ]; then
    echo -e "  ${GRAY}-> 正在创建 Python 虚拟环境...${NC}"
    python3 -m venv "$VENV_PATH" 2>/dev/null || python -m venv "$VENV_PATH"
    echo -e "  ${GREEN}[OK] 虚拟环境已创建: $VENV_PATH${NC}"
else
    echo -e "  ${GREEN}[OK] 虚拟环境已存在且路径正确，跳过${NC}"
fi

echo -e "  ${GRAY}-> 正在安装 Python 依赖...${NC}"
"$VENV_PATH/bin/pip" install -r "$SCRIPT_DIR/server/requirements.txt"
echo -e "  ${GREEN}[OK] Python 依赖安装完成${NC}"

# ==================== 2. 后端配置 (.env) ====================
echo -e "${YELLOW}[2/5] 后端环境配置${NC}"
if [ ! -f "$SCRIPT_DIR/server/.env" ]; then
    cp "$SCRIPT_DIR/server/.env.template" "$SCRIPT_DIR/server/.env"
    echo -e "  ${GREEN}[OK] 已创建 .env 文件 (从 .env.template)${NC}"
else
    echo -e "  ${GREEN}[OK] .env 文件已存在，跳过${NC}"
fi

# ==================== 3. AI 配置 ====================
echo -e "${YELLOW}[3/5] AI 对话配置${NC}"
CONFIG_FILE="$SCRIPT_DIR/common/appConfig.js"
echo -e "  ${GRAY}[i] 编辑 common/appConfig.js 或在运行时设置${NC}"

read -p "  [?] 是否要配置 AI API Key？(y/n，默认 n): " input
if [[ "$input" =~ ^[Yy]$ ]]; then
    read -p "  请输入 API Key (sk-xxx): " apiKey
    read -p "  请输入模型名称 (默认: deepseek-chat): " model
    read -p "  请输入 API 地址 (默认: https://api.deepseek.com/v1): " baseUrl

    [ -z "$model" ] && model="deepseek-chat"
    [ -z "$baseUrl" ] && baseUrl="https://api.deepseek.com/v1"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|\(apiKey:\s*\)'.*'|\1'$apiKey'|" "$CONFIG_FILE"
        sed -i '' "s|\(baseURL:\s*\)'[^']*'|\1'$baseUrl'|" "$CONFIG_FILE"
        sed -i '' "s|\(model:\s*\)'[^']*'|\1'$model'|" "$CONFIG_FILE"
    else
        sed -i "s|\(apiKey:\s*\)'.*'|\1'$apiKey'|" "$CONFIG_FILE"
        sed -i "s|\(baseURL:\s*\)'[^']*'|\1'$baseUrl'|" "$CONFIG_FILE"
        sed -i "s|\(model:\s*\)'[^']*'|\1'$model'|" "$CONFIG_FILE"
    fi
    echo -e "  ${GREEN}[OK] AI 配置已更新${NC}"
fi

# ==================== 4. 检测服务配置 ====================
echo -e "${YELLOW}[4/5] 检测服务配置${NC}"
read -p "  [?] 是否要配置检测服务地址？(y/n，默认 n): " input
if [[ "$input" =~ ^[Yy]$ ]]; then
    read -p "  请输入检测服务地址 (默认: http://localhost:5000): " detectUrl
    [ -z "$detectUrl" ] && detectUrl="http://localhost:5000"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|\(baseURL:\s*\)'[^']*'|\1'$detectUrl'|" "$CONFIG_FILE"
    else
        sed -i "s|\(baseURL:\s*\)'[^']*'|\1'$detectUrl'|" "$CONFIG_FILE"
    fi
    echo -e "  ${GREEN}[OK] 检测服务地址已更新${NC}"
fi

# 检测模型
MODEL_PATH="$SCRIPT_DIR/server/models/best.pt"
if [ -f "$MODEL_PATH" ]; then
    echo -e "  ${GREEN}[OK] YOLO 模型文件存在: server/models/best.pt${NC}"
else
    echo -e "  ${YELLOW}[WARN] YOLO 模型文件不存在，请将 best.pt 放到 server/models/ 目录${NC}"
fi

# ==================== 5. 完成 ====================
echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   配置完成！${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "  启动后端服务:"
echo -e "    cd server"
echo -e "    source ../.venv/bin/activate"
echo -e "    python app.py"
echo ""
echo -e "  提示: 如果拷贝项目到新电脑，只需再次运行本脚本即可"
echo ""
