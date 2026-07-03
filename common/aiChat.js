import { getAIConfig } from './appConfig.js'

// ===== 从统一配置中心读取 =====
function _loadDef() {
  const c = getAIConfig()
  return {
    baseURL: c.baseURL,
    model: c.model,
    apiKey: c.apiKey,
    timeout: c.timeout,
    maxTokens: c.maxTokens,
    temperature: c.temperature,
    topP: c.topP,
    systemPrompt: c.systemPrompt,
    maxHistoryLen: c.maxHistoryLen,
    maxRounds: c.maxRounds,
    retryTimes: c.retryTimes,
    retryDelay: c.retryDelay,
    stream: c.stream,
  }
}

export const AI_CHAT_CONFIG = _loadDef()


export function AiChatError(msg, code, status) {
  const e = new Error(msg)
  e.name = 'AiChatError'
  e.code = code || 'UNKNOWN'
  e.status = status || null
  return e
}


export function createSession(opts) {
  const DEF = _loadDef()
  const cfg = { ...DEF, ...(opts || {}) }
  const msgs = []

  if (cfg.systemPrompt) {
    msgs.push({ role: 'system', content: cfg.systemPrompt })
  }

  const tok = (s) => Math.ceil((s || '').length / 1.5)
  const total = () => msgs.reduce((s, m) => s + tok(m.content), 0)

  const trim = () => {
    const sys = msgs.filter(m => m.role === 'system')
    let his = msgs.filter(m => m.role !== 'system')

    while (his.length > cfg.maxRounds * 2) his.shift()
    while (total() > cfg.maxHistoryLen && his.length > 2) his.shift()

    msgs.length = 0
    msgs.push(...sys, ...his)
  }

  return {
    get messages() { return [...msgs] },

    addUser(text) {
      msgs.push({ role: 'user', content: text })
      trim()
    },

    addBot(text) {
      msgs.push({ role: 'assistant', content: text })
      trim()
    },

    clear(keepSys = true) {
      if (keepSys) {
        const sys = msgs.filter(m => m.role === 'system')
        msgs.length = 0
        msgs.push(...sys)
      } else {
        msgs.length = 0
      }
    },

    getConfig() { return { ...cfg } },
    setConfig(ov) { Object.assign(cfg, ov || {}) },
  }
}


const delay = (ms) => new Promise(r => setTimeout(r, ms))


async function reqNonStream(msgs, cfg, signal) {
  if (signal?.aborted) throw AiChatError('\u8bf7\u6c42\u53d6\u6d88\u4e86', 'ABORTED')

  return new Promise((res, rej) => {
    const tk = uni.request({
      url: cfg.baseURL.replace(/\/+$/, '') + '/chat/completions',
      method: 'POST',
      timeout: cfg.timeout,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cfg.apiKey
      },
      data: {
        model: cfg.model,
        messages: msgs,
        temperature: cfg.temperature,
        max_tokens: cfg.maxTokens,
        top_p: cfg.topP,
        stream: false
      },
      success(r) {
        const s = r.statusCode
        if (s === 401) return rej(AiChatError('API Key \u4e0d\u5bf9\uff0c\u68c0\u67e5\u4e00\u4e0b', 'UNAUTHORIZED', 401))
        if (s === 429) return rej(AiChatError('\u9891\u7387\u592a\u5feb\u4e86\u6b47\u4e00\u6b47', 'RATE_LIMITED', 429))
        if (s === 503) return rej(AiChatError('\u670d\u52a1\u6682\u4e0d\u53ef\u7528', 'SERVICE_DOWN', 503))
        if (s < 200 || s >= 300) {
          const em = r.data?.error?.message || r.errMsg || ''
          return rej(AiChatError('\u63a5\u53e3\u62a5\u9519(' + s + '): ' + em, 'API_ERROR', s))
        }

        const reply = r.data?.choices?.[0]?.message?.content
        if (reply && reply.trim()) return res(reply.trim())
        rej(AiChatError('AI \u6ca1\u8fd4\u56de\u5185\u5bb9', 'EMPTY'))
      },
      fail(err) {
        if (err.errMsg?.includes('abort') || err.errMsg?.includes('cancel')) {
          rej(AiChatError('\u8bf7\u6c42\u53d6\u6d88', 'ABORTED'))
        } else {
          rej(AiChatError('\u7f51\u7edc\u70b8\u4e86: ' + (err.errMsg || '?'), 'NET'))
        }
      }
    })

    if (signal) {
      signal.addEventListener('abort', () => { tk.abort(); rej(AiChatError('\u53d6\u6d88', 'ABORTED')) }, { once: true })
    }
  })
}


function reqStream(msgs, cfg, signal, onMsg) {
  if (signal?.aborted) throw AiChatError('\u53d6\u6d88\u4e86', 'ABORTED')

  return new Promise((res, rej) => {
    let full = ''

    const tk = uni.request({
      url: cfg.baseURL.replace(/\/+$/, '') + '/chat/completions',
      method: 'POST',
      timeout: cfg.timeout,
      responseType: 'arraybuffer',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cfg.apiKey,
        'Accept': 'text/event-stream'
      },
      data: {
        model: cfg.model,
        messages: msgs,
        temperature: cfg.temperature,
        max_tokens: cfg.maxTokens,
        top_p: cfg.topP,
        stream: true
      },
      success(r) {
        const s = r.statusCode
        if (s === 401) return rej(AiChatError('Key \u65e0\u6548', 'UNAUTHORIZED', 401))
        if (s === 429) return rej(AiChatError('\u9650\u9891', 'RATE_LIMITED', 429))
        if (s < 200 || s >= 300) return rej(AiChatError('\u9519' + s + ')', 'API_ERROR', s))

        try {
          const dec = new TextDecoder('utf-8')
          const txt = dec.decode(r.data)
          const j = JSON.parse(txt)
          const rp = j?.choices?.[0]?.message?.content
          if (rp) { onMsg?.(rp); return res(rp) }
        } catch (_) {}

        try {
          const dec = new TextDecoder('utf-8')
          const raw = dec.decode(r.data, { stream: true })
          raw.split('\n').forEach(line => {
            const t = line.trim()
            if (!t || t.startsWith(':')) return
            if (t === 'data: [DONE]') return
            if (t.startsWith('data: ')) {
              try {
                const d = JSON.parse(t.slice(6))
                const delta = d?.choices?.[0]?.delta?.content
                if (delta) {
                  full += delta
                  onMsg?.(delta)
                }
                if (d?.choices?.[0]?.finish_reason === 'stop') return
              } catch (_) {}
            }
          })

          if (full) return res(full)
          rej(AiChatError('\u8fd4\u56de\u7a7a', 'EMPTY'))
        } catch (e) {
          rej(AiChatError('\u89e3\u6790\u5931\u8d25: ' + e.message, 'PARSE'))
        }
      },
      fail(err) {
        if (err.errMsg?.includes('abort') || err.errMsg?.includes('cancel')) {
          rej(AiChatError('\u53d6\u6d88', 'ABORTED'))
        } else if (full) {
          res(full)
        } else {
          rej(AiChatError('\u7f51\u7edc: ' + (err.errMsg || ''), 'NET'))
        }
      }
    })

    if (signal) {
      signal.addEventListener('abort', () => {
        tk.abort()
        if (full) res(full)
        else rej(AiChatError('\u53d6\u6d88', 'ABORTED'))
      }, { once: true })
    }
  })
}


export async function askAiChat(p) {
  const DEF = _loadDef()
  const { message, history, signal, options } = p || {}
  const cfg = { ...DEF, ...(options || {}) }

  if (!cfg.apiKey) {
    throw AiChatError('\u6ca1\u914d apiKey\uff0c\u53bb aiChat copy.js \u91cc\u627e', 'NO_KEY')
  }

  const msgs = []
  if (cfg.systemPrompt) msgs.push({ role: 'system', content: cfg.systemPrompt })
  ;(history || []).forEach(h => {
    msgs.push({ role: h.role || 'user', content: h.content || h.text || '' })
  })
  msgs.push({ role: 'user', content: message })

  let lastErr = null
  for (let i = 0; i <= cfg.retryTimes; i++) {
    if (i > 0) await delay(cfg.retryDelay * i)
    try {
      return await reqNonStream(msgs, cfg, signal)
    } catch (e) {
      lastErr = e
      if (e.code === 'NO_KEY' || e.code === 'ABORTED') throw e
      if (e.status && e.status < 500 && e.status !== 429) throw e
    }
  }
  throw lastErr
}

export async function askAiChatStream(p) {
  const DEF = _loadDef()
  const { message, history, onMessage, onDone, onError, signal, options } = p || {}
  const cfg = { ...DEF, ...(options || {}) }

  if (!cfg.apiKey) {
    const e = AiChatError('\u6ca1\u914d apiKey', 'NO_KEY')
    onError?.(e)
    throw e
  }

  const msgs = []
  if (cfg.systemPrompt) msgs.push({ role: 'system', content: cfg.systemPrompt })
  ;(history || []).forEach(h => {
    msgs.push({ role: h.role || 'user', content: h.content || h.text || '' })
  })
  msgs.push({ role: 'user', content: message })

  let lastErr = null
  for (let i = 0; i <= cfg.retryTimes; i++) {
    if (i > 0) await delay(cfg.retryDelay * i)
    try {
      const txt = await reqStream(msgs, cfg, signal, onMessage)
      onDone?.(txt)
      return txt
    } catch (e) {
      lastErr = e
      if (e.code === 'NO_KEY') { onError?.(e); throw e }
      if (e.code === 'ABORTED') { onError?.(e); throw e }
      if (e.status && e.status < 500 && e.status !== 429) { onError?.(e); throw e }
    }
  }
  onError?.(lastErr)
  throw lastErr
}

export async function chatWithSession(session, msg, cb, signal) {
  const cfg = session.getConfig()
  session.addUser(msg)

  const reply = await askAiChatStream({
    message: msg,
    history: session.messages.slice(0, -1),
    onMessage: cb?.onMessage,
    onError: cb?.onError,
    signal,
    options: cfg
  })

  session.addBot(reply)
  cb?.onDone?.(reply)
  return reply
}

export default { askAiChat, askAiChatStream, createSession, chatWithSession, AI_CHAT_CONFIG }
