import { getDetectConfig } from './appConfig.js'

export const DETECT_API_CONFIG = getDetectConfig()

export function getBaseURL() {
	try {
		return uni.getStorageSync('DETECT_API_URL') || DETECT_API_CONFIG.baseURL
	} catch (_) {
		return DETECT_API_CONFIG.baseURL
	}
}

/**
 * 上传图片并检测
 * @param {string} filePath 本地图片路径
 * @param {{ conf?: number }} options
 * @returns {Promise<object>}
 */
export function detectEggImage(filePath, options = {}) {
	const baseURL = getBaseURL()
	const conf = options.conf ?? DETECT_API_CONFIG.conf

	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: baseURL.replace(/\/+$/, '') + '/api/detect',
			filePath,
			name: 'file',
			formData: { conf: String(conf) },
			timeout: DETECT_API_CONFIG.timeout,
			success: (res) => {
				let data = res.data
				if (typeof data === 'string') {
					try {
						data = JSON.parse(data)
					} catch (_) {
						reject(new Error('服务器返回格式异常'))
						return
					}
				}
				if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
					resolve(data)
					return
				}
				reject(new Error(data?.error || `检测失败 (${res.statusCode})`))
			},
			fail: (err) => {
				reject(new Error('无法连接检测服务，请确认后端已启动且地址正确：' + (err.errMsg || '')))
			}
		})
	})
}

export function checkDetectHealth() {
	const baseURL = getBaseURL()
	return new Promise((resolve, reject) => {
		uni.request({
			url: baseURL.replace(/\/+$/, '') + '/api/health',
			timeout: 8000,
			success: (res) => {
				if (res.statusCode === 200) resolve(res.data)
				else reject(new Error('检测服务不可用'))
			},
			fail: (err) => reject(new Error(err.errMsg || '连接失败'))
		})
	})
}
