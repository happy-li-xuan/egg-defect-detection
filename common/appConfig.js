/**
 * ============================================
 *  🥚 鸡蛋缺陷检测系统 - 统一配置中心
 *  ============================================
 *  本文件是前端（UniApp）配置的唯一来源。
 *  所有模块（AI 对话、检测 API 等）均从此读取配置。
 *
 *  📦 部署方式：
 *    方式一：直接修改本文件的默认值
 *    方式二：通过 localStorage 在运行时覆盖
 *      uni.setStorageSync('AI_API_KEY', 'sk-xxx')
 *      uni.setStorageSync('DETECT_API_URL', 'http://192.168.1.100:5000')
 *    方式三：运行 setup.ps1 / setup.sh 交互式配置
 * ============================================
 */

// ==================== AI 对话配置（OpenAI 兼容接口） ====================
export const AI_CONFIG = {
  /** API 基础地址（支持 OpenAI / DeepSeek / Moonshot / 通义千问 等） */
  baseURL: 'https://api.deepseek.com/v1',

  /** 模型名称 */
  model: 'deepseek-chat',

  /** API Key（也可通过 uni.setStorageSync('AI_API_KEY', 'sk-xxx') 设置） */
  apiKey: 'sk-dddf0579fe384c789d667f945b8e9f5ess',

  /** 超时时间（毫秒） */
  timeout: 60000,

  /** 最大生成 Token 数 */
  maxTokens: 2048,

  /** 生成温度 0-2，越低越确定 */
  temperature: 0.7,

  /** Top-P 采样 */
  topP: 1,

  /** 系统提示词 */
  systemPrompt:
    '你是鸡蛋缺陷检测系统的智能助手，熟悉蛋壳质检、裂纹识别、光照阴影误判等。请用简洁专业的中文回答。',

  /** 历史上下文最大 Token 数 */
  maxHistoryLen: 4096,

  /** 最大对话轮数 */
  maxRounds: 20,

  /** 重试次数 */
  retryTimes: 2,

  /** 重试间隔（毫秒） */
  retryDelay: 1000,

  /** 是否使用流式输出 */
  stream: true,
}

// ==================== 检测服务配置 ====================
export const DETECT_CONFIG = {
  /** 检测服务地址（也支持通过 uni.setStorageSync('DETECT_API_URL', 'url') 设置） */
  baseURL: 'http://localhost:5000',

  /** 模型文件名 */
  model: 'best.pt',

  /** 默认置信度阈值 */
  conf: 0.65,

  /** 请求超时（毫秒） */
  timeout: 120000,
}

// ==================== 运行时读取辅助函数 ====================

/**
 * 获取 AI 对话配置
 * - 优先使用运行时 localStorage 覆盖
 * - 可传入 options 临时覆盖
 */
export function getAIConfig(options = {}) {
  const cfg = { ...AI_CONFIG }
  try {
    const stored = uni.getStorageSync('AI_API_KEY')
    if (stored) cfg.apiKey = stored
  } catch (_) {}
  try {
    const stored = uni.getStorageSync('AI_BASE_URL')
    if (stored) cfg.baseURL = stored
  } catch (_) {}
  try {
    const stored = uni.getStorageSync('AI_MODEL')
    if (stored) cfg.model = stored
  } catch (_) {}
  return { ...cfg, ...options }
}

/**
 * 获取检测服务配置
 * - 优先使用运行时 localStorage 覆盖
 */
export function getDetectConfig(options = {}) {
  const cfg = { ...DETECT_CONFIG }
  try {
    const stored = uni.getStorageSync('DETECT_API_URL')
    if (stored) cfg.baseURL = stored
  } catch (_) {}
  return { ...cfg, ...options }
}

export default { AI_CONFIG, DETECT_CONFIG, getAIConfig, getDetectConfig }
