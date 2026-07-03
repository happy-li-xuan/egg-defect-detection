
// ===================== 配置区 =====================
export const AI_CHAT_CONFIG = {
    // ---- API 基础配置（OpenAI 兼容：OpenAI / DeepSeek / Moonshot / 通义千问 等）----
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: 'sk-dddf0579fe384c789d667f945b8e9f5e', // 在此填写，或通过 uni.setStorageSync('AI_API_KEY', 'sk-xxx') 写入
    timeout: 60000,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 1,
    systemPrompt:
        '你是鸡蛋缺损检测系统的智能助手，熟悉蛋壳视觉质检、裂纹与暗斑识别、光照阴影误判、置信度阈值调参、批次追溯与产线运维。请用简洁专业的中文回答，给出可落地的现场建议。',
    maxContextLength: 4096,
    maxHistoryMessages: 20,
    retryCount: 2,
    retryDelay: 1000,
    stream: true,
}

// ===================== 内置错误类 =====================
export class AiChatError extends Error {
    constructor(message, code = 'UNKNOWN', status = null) {
        super(message)
        this.name = 'AiChatError'
        this.code = code
        this.status = status
    }
}

// ===================== 对话会话管理 =====================
export function createSession(options = {}) {
    const config = { ...AI_CHAT_CONFIG, ...options }
    const messages = []

    if (config.systemPrompt) {
        messages.push({ role: 'system', content: config.systemPrompt })
    }

    function estimateTokens(text) {
        return Math.ceil((text || '').length / 1.5)
    }

    function totalTokens() {
        return messages.reduce((sum, m) => sum + estimateTokens(m.content), 0)
    }

    function trimContext() {
        const system = messages.filter(m => m.role === 'system')
        let history = messages.filter(m => m.role !== 'system')

        while (history.length > config.maxHistoryMessages * 2) {
            history.shift()
        }

        while (totalTokens() > config.maxContextLength && history.length > 2) {
            history.shift()
        }

        messages.length = 0
        messages.push(...system, ...history)
    }

    const session = {
        get messages() { return [...messages] },

        addUserMessage(text) {
            messages.push({ role: 'user', content: text })
            trimContext()
        },

        addAssistantMessage(text) {
            messages.push({ role: 'assistant', content: text })
            trimContext()
        },

        clear(keepSystem = true) {
            if (keepSystem) {
                const system = messages.filter(m => m.role === 'system')
                messages.length = 0
                messages.push(...system)
            } else {
                messages.length = 0
            }
        },

        getConfig() { return { ...config } },
        setConfig(overrides) { Object.assign(config, overrides) }
    }

    return session
}

// ===================== 核心 API 调用 =====================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function resolveConfig(options = {}) {
    const config = { ...AI_CHAT_CONFIG, ...options }
    if (!config.apiKey) {
        try {
            config.apiKey = uni.getStorageSync('AI_API_KEY') || ''
        } catch (_) {}
    }
    return config
}

function buildMessages(message, history, systemPrompt) {
    const messages = []
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
    }
    for (const h of history) {
        if (h.role === 'system') continue
        messages.push({
            role: h.role || 'user',
            content: h.content || h.text || ''
        })
    }
    messages.push({ role: 'user', content: message })
    return messages
}

function consumeSSEBuffer(buffer, onDelta) {
    const lines = buffer.split('\n')
    const remaining = lines.pop() || ''
    let fullDelta = ''
    for (const line of lines) {
        const parsed = _parseSSELine(line)
        if (parsed === null || parsed === '[DONE]') continue
        try {
            const data = JSON.parse(parsed)
            const delta = data?.choices?.[0]?.delta?.content
            if (delta) {
                fullDelta += delta
                onDelta?.(delta)
            }
        } catch (_) {}
    }
    return { remaining, fullDelta }
}

export async function askAiChat({
    message,
    history = [],
    signal,
    options = {}
} = {}) {
    const config = resolveConfig(options)

    if (!config.apiKey) {
        throw new AiChatError(
            '请先配置 API Key：在 common/aiChat.js 填写 apiKey，或执行 uni.setStorageSync("AI_API_KEY", "sk-xxx")',
            'NO_API_KEY'
        )
    }

    const messages = buildMessages(message, history, config.systemPrompt)

    let lastError = null
    for (let attempt = 0; attempt <= config.retryCount; attempt++) {
        if (attempt > 0) {
            await delay(config.retryDelay * attempt)
        }
        try {
            return await _requestNonStream(messages, config, signal)
        } catch (err) {
            lastError = err
            if (err.name === 'AiChatError' && err.code === 'NO_API_KEY') throw err
            if (err.name === 'AbortError') throw err
            if (err.status && err.status < 500 && err.status !== 429) throw err
        }
    }
    throw lastError
}

export async function askAiChatStream({
    message,
    history = [],
    onMessage,
    onDone,
    onError,
    signal,
    options = {}
} = {}) {
    const config = resolveConfig(options)

    if (!config.apiKey) {
        const err = new AiChatError(
            '请先配置 API Key：在 common/aiChat.js 填写 apiKey，或执行 uni.setStorageSync("AI_API_KEY", "sk-xxx")',
            'NO_API_KEY'
        )
        onError?.(err)
        throw err
    }

    const messages = buildMessages(message, history, config.systemPrompt)

    let lastError = null
    for (let attempt = 0; attempt <= config.retryCount; attempt++) {
        if (attempt > 0) {
            await delay(config.retryDelay * attempt)
        }
        try {
            const fullText = await _requestStream(messages, config, signal, onMessage)
            onDone?.(fullText)
            return fullText
        } catch (err) {
            lastError = err
            if (err.name === 'AiChatError' && err.code === 'NO_API_KEY') {
                onError?.(err); throw err
            }
            if (err.name === 'AbortError') {
                onError?.(err); throw err
            }
            if (err.status && err.status < 500 && err.status !== 429) {
                onError?.(err); throw err
            }
        }
    }
    onError?.(lastError)
    throw lastError
}

// ===================== 底层 HTTP 请求 =====================

function _parseErrorBody(data) {
    if (!data) return ''
    if (typeof data === 'string') {
        try {
            const json = JSON.parse(data)
            return json?.error?.message || json?.message || data
        } catch (_) {
            return data
        }
    }
    if (typeof data === 'object') {
        if (data.error?.message) return data.error.message
        if (data.byteLength) {
            try {
                const text = new TextDecoder('utf-8').decode(data)
                const json = JSON.parse(text)
                return json?.error?.message || text
            } catch (_) {}
        }
    }
    return ''
}

function _mapApiStatusError(status, data) {
    const detail = _parseErrorBody(data)
    const suffix = detail ? '：' + detail : ''
    switch (status) {
        case 401:
            return new AiChatError('API Key 无效或未授权' + suffix, 'UNAUTHORIZED', 401)
        case 402:
            return new AiChatError(
                '账户余额不足，请前往 DeepSeek 控制台（platform.deepseek.com）充值后再试' + suffix,
                'PAYMENT_REQUIRED',
                402
            )
        case 429:
            return new AiChatError('请求过于频繁，请稍后重试' + suffix, 'RATE_LIMITED', 429)
        case 503:
            return new AiChatError('AI 服务暂时不可用' + suffix, 'SERVICE_UNAVAILABLE', 503)
        default:
            return new AiChatError('AI 接口错误 (' + status + ')' + suffix, 'API_ERROR', status)
    }
}

function _requestNonStream(messages, config, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new AiChatError('请求已取消', 'ABORTED'))
            return
        }

        const requestTask = uni.request({
            url: config.baseURL.replace(/\/+$/, '') + '/chat/completions',
            method: 'POST',
            timeout: config.timeout,
            header: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config.apiKey
            },
            data: {
                model: config.model,
                messages,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                top_p: config.topP,
                stream: false
            },
            success: (res) => {
                if (res.statusCode === 401 || res.statusCode === 402 || res.statusCode === 429 || res.statusCode === 503) {
                    reject(_mapApiStatusError(res.statusCode, res.data))
                    return
                }
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject(_mapApiStatusError(res.statusCode, res.data))
                    return
                }

                const data = res.data
                const reply = data?.choices?.[0]?.message?.content
                if (typeof reply === 'string' && reply.trim()) {
                    resolve(reply.trim())
                } else {
                    reject(new AiChatError('AI 返回内容为空', 'EMPTY_RESPONSE'))
                }
            },
            fail: (err) => {
                if (err.errMsg?.includes('abort') || err.errMsg?.includes('cancel')) {
                    reject(new AiChatError('请求已取消', 'ABORTED'))
                } else {
                    reject(new AiChatError('网络请求失败: ' + (err.errMsg || '未知错误'), 'NETWORK_ERROR'))
                }
            }
        })

        if (signal) {
            signal.addEventListener('abort', () => {
                requestTask.abort()
                reject(new AiChatError('请求已取消', 'ABORTED'))
            }, { once: true })
        }
    })
}


function _requestStream(messages, config, signal, onMessage) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new AiChatError('请求已取消', 'ABORTED'))
            return
        }
        let fullText = ''
        let sseBuffer = ''
        const requestTask = uni.request({
            url: config.baseURL.replace(/\/+$/, '') + '/chat/completions',
            method: 'POST',
            timeout: config.timeout,
            responseType: 'arraybuffer',
            enableChunked: true,
            header: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config.apiKey,
                'Accept': 'text/event-stream'
            },
            data: {
                model: config.model,
                messages,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                top_p: config.topP,
                stream: true
            },
            success: (res) => {
                if (res.statusCode === 401 || res.statusCode === 402 || res.statusCode === 429 || res.statusCode === 503) {
                    reject(_mapApiStatusError(res.statusCode, res.data))
                    return
                }
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject(_mapApiStatusError(res.statusCode, res.data))
                    return
                }
                if (fullText) {
                    if (sseBuffer.trim()) {
                        consumeSSEBuffer(sseBuffer, (delta) => {
                            fullText += delta
                            onMessage?.(delta)
                        })
                    }
                    resolve(fullText.trim())
                    return
                }
                if (!res.data) {
                    reject(new AiChatError('AI 返回内容为空', 'EMPTY_RESPONSE'))
                    return
                }
                try {
                    const decoder = new TextDecoder('utf-8')
                    const text = decoder.decode(res.data)
                    try {
                        const json = JSON.parse(text)
                        const reply = json?.choices?.[0]?.message?.content
                        if (reply) {
                            onMessage?.(reply)
                            resolve(reply)
                            return
                        }
                    } catch (_) {}
                    sseBuffer += text
                    const { remaining } = consumeSSEBuffer(sseBuffer, (delta) => {
                        fullText += delta
                        onMessage?.(delta)
                    })
                    sseBuffer = remaining
                } catch (_) {}
                if (fullText) resolve(fullText)
                else reject(new AiChatError('AI 返回内容为空', 'EMPTY_RESPONSE'))
            },
            fail: (err) => {
                if (err.errMsg?.includes('abort') || err.errMsg?.includes('cancel')) {
                    reject(new AiChatError('请求已取消', 'ABORTED'))
                } else if (fullText) resolve(fullText)
                else reject(new AiChatError('网络请求失败: ' + (err.errMsg || '未知错误'), 'NETWORK_ERROR'))
            }
        })
        if (requestTask.onChunkReceived) {
            requestTask.onChunkReceived((res) => {
                try {
                    const decoder = new TextDecoder('utf-8')
                    sseBuffer += decoder.decode(new Uint8Array(res.data))
                    const { remaining } = consumeSSEBuffer(sseBuffer, (delta) => {
                        fullText += delta
                        onMessage?.(delta)
                    })
                    sseBuffer = remaining
                } catch (_) {}
            })
        }

        if (signal) {
            signal.addEventListener('abort', () => {
                requestTask.abort()
                if (fullText) resolve(fullText)
                else reject(new AiChatError('请求已取消', 'ABORTED'))
            }, { once: true })
        }
    })
}

function _parseSSELine(line) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith(':')) return null
    if (trimmed === 'data: [DONE]') return '[DONE]'
    if (trimmed.startsWith('data: ')) {
        return trimmed.slice(6)
    }
    return null
}

// ===================== 快捷方法 =====================

export async function chatWithSession(session, message, callbacks = {}, signal) {
    const config = session.getConfig()
    session.addUserMessage(message)

    const reply = await askAiChatStream({
        message,
        history: session.messages.slice(0, -1),
        onMessage: callbacks.onMessage,
        onError: callbacks.onError,
        signal,
        options: config
    })

    session.addAssistantMessage(reply)
    callbacks.onDone?.(reply)
    return reply
}

export default { askAiChat, askAiChatStream, createSession, chatWithSession, AI_CHAT_CONFIG }
