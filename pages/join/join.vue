<template>
	<view class="page">
		<view class="upload-card">
			<!-- 检测页面 -->
			<view class="title">鸡蛋缺损检测</view>
			<view class="desc">上传鸡蛋图片，自动调用鸡蛋缺损检测模型识别污渍、破损等缺陷。</view>

			<view class="preview-box" @click="chooseImage">
				<image v-if="imagePath" class="preview-img" :src="displayImage" mode="aspectFit" />
				<view v-else class="preview-placeholder">
					<text class="placeholder-icon">+</text>
					<text class="placeholder-text">点击选择或拍摄图片</text>
				</view>
			</view>

			<view class="btn-row">
				<button class="ghost-btn" :disabled="detecting" @click="chooseImage">选择图片</button>
				<button class="primary-btn" :disabled="!imagePath || detecting" @click="runDetect">
					{{ detecting ? '检测中…' : '开始检测' }}
				</button>
			</view>
		</view>

		<view v-if="detectResult" class="panel result-panel">
			<view class="panel-title">检测结果</view>
			<view class="result-badge" :class="detectResult.level">{{ detectResult.result }}</view>
			<view class="result-summary">{{ detectResult.summary }}</view>

			<image
				v-if="detectResult.image"
				class="result-img"
				:src="detectResult.image"
				mode="widthFix"
			/>

			<view v-if="detectResult.detections && detectResult.detections.length" class="det-list">
				<view class="det-item" v-for="(d, i) in detectResult.detections" :key="i">
					<view class="det-name">{{ d.class }}</view>
					<view class="det-meta">置信度 {{ (d.confidence * 100).toFixed(1) }}%</view>
				</view>
			</view>
			<view v-else class="empty-tip">未识别到缺陷目标</view>
		</view>

		<view class="panel">
			<view class="panel-title">检测参数</view>
			<view class="line"><text>模型文件</text><text>{{ config.model }}</text></view>
			<!-- <view class="line"><text>置信度阈值</text><text>{{ config.threshold }}</text></view> -->
			<view class="line"><text>服务地址</text><text class="api-url">{{ config.apiUrl }}</text></view>
		</view>

		<view class="panel">
			<view class="panel-title">最近检测记录</view>
			<view v-if="records.length" class="record" v-for="item in records" :key="item.id">
				<view>
					<view class="record-name">{{ item.batch }}</view>
					<view class="record-time">{{ item.time }}</view>
				</view>
				<view class="record-result" :class="item.level">{{ item.result }}</view>
			</view>
			<view v-else class="empty-tip">暂无记录，上传图片检测后将自动保存</view>
		</view>
	</view>
</template>

<script>
import { detectEggImage, DETECT_API_CONFIG } from '@/common/detectApi.js'

let recordSeq = 1

function formatNow() {
	const d = new Date()
	const h = String(d.getHours()).padStart(2, '0')
	const m = String(d.getMinutes()).padStart(2, '0')
	return `今天 ${h}:${m}`
}

function makeBatchId() {
	const d = new Date()
	const y = d.getFullYear()
	const mo = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	const seq = String(recordSeq).padStart(2, '0')
	return `BATCH-${y}${mo}${day}-${seq}`
}

export default {
	data() {
		return {
			imagePath: '',
			displayImage: '',
			detecting: false,
			detectResult: null,
			config: {
				model: DETECT_API_CONFIG.model,
				threshold: String(DETECT_API_CONFIG.conf),
				apiUrl: DETECT_API_CONFIG.baseURL
			},
			records: []
		}
	},
	onShow() {
		try {
			const saved = uni.getStorageSync('detectRecords')
			if (Array.isArray(saved) && saved.length) {
				this.records = saved
				recordSeq = saved.length + 1
			}
		} catch (_) {}
		try {
			const url = uni.getStorageSync('DETECT_API_URL')
			if (url) this.config.apiUrl = url
		} catch (_) {}
	},
	methods: {
		chooseImage() {
			if (this.detecting) return
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.imagePath = res.tempFilePaths[0]
					this.displayImage = this.imagePath
					this.detectResult = null
				}
			})
		},
		async runDetect() {
			if (!this.imagePath || this.detecting) return
			this.detecting = true
			this.detectResult = null
			uni.showLoading({ title: '模型推理中…', mask: true })
			try {
				const data = await detectEggImage(this.imagePath, {
					conf: Number(this.config.threshold)
				})
				this.detectResult = data
				if (data.image) {
					this.displayImage = data.image
				}
				const record = {
					id: ++recordSeq,
					batch: makeBatchId(),
					time: formatNow(),
					result: data.result,
					level: data.level
				}
				this.records.unshift(record)
				if (this.records.length > 20) this.records.length = 20
				uni.setStorageSync('detectRecords', this.records)
				uni.showToast({ title: '检测完成', icon: 'success' })
			} catch (e) {
				uni.showModal({
					title: '检测失败',
					content: e.message || '请确认后端服务已启动且 best.pt 已放置',
					showCancel: false
				})
			} finally {
				this.detecting = false
				uni.hideLoading()
			}
		}
	}
}
</script>

<style>
.page {
	padding: 24upx;
	padding-bottom: 160upx;
	background: #f4f7fc;
	min-height: 100vh;
}
.upload-card {
	background: linear-gradient(135deg, #0ea5e9, #2563eb);
	padding: 26upx;
	border-radius: 20upx;
	color: #fff;
}
.title { font-size: 34upx; font-weight: 700; }
.desc { margin-top: 10upx; opacity: 0.95; line-height: 1.5; font-size: 24upx; }
.preview-box {
	margin-top: 20upx;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 16upx;
	min-height: 320upx;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
}
.preview-img { width: 100%; max-height: 420upx; }
.preview-placeholder { text-align: center; padding: 40upx; }
.placeholder-icon { display: block; font-size: 64upx; line-height: 1; opacity: 0.9; }
.placeholder-text { display: block; margin-top: 12upx; font-size: 24upx; opacity: 0.85; }
.btn-row {
	display: flex;
	gap: 16upx;
	margin-top: 18upx;
}
.primary-btn, .ghost-btn {
	flex: 1;
	margin: 0;
	border-radius: 999upx;
	font-size: 26upx;
}
.primary-btn { background: #fff; color: #1d4ed8; }
.primary-btn[disabled] { opacity: 0.55; }
.ghost-btn { background: rgba(255,255,255,0.2); color: #fff; }
.panel {
	margin-top: 20upx;
	background: #fff;
	border-radius: 16upx;
	padding: 20upx;
}
.panel-title { font-size: 30upx; font-weight: 600; margin-bottom: 10upx; }
.line {
	display: flex;
	justify-content: space-between;
	padding: 12upx 0;
	border-bottom: 1px solid #eef2f7;
	font-size: 24upx;
	gap: 16upx;
}
.line:last-child { border-bottom: none; }
.api-url { max-width: 360upx; text-align: right; word-break: break-all; color: #6b7280; font-size: 22upx; }
.result-panel { border: 2upx solid #dbeafe; }
.result-badge {
	display: inline-block;
	font-size: 28upx;
	font-weight: 700;
	padding: 10upx 22upx;
	border-radius: 999upx;
	margin-bottom: 12upx;
}
.result-badge.good { color: #047857; background: #d1fae5; }
.result-badge.normal { color: #b45309; background: #fef3c7; }
.result-badge.danger { color: #b91c1c; background: #fee2e2; }
.result-summary { font-size: 24upx; color: #4b5563; margin-bottom: 16upx; }
.result-img {
	width: 100%;
	border-radius: 12upx;
	margin-bottom: 16upx;
}
.det-list { margin-top: 8upx; }
.det-item {
	display: flex;
	justify-content: space-between;
	padding: 12upx 0;
	border-bottom: 1px solid #f1f5f9;
	font-size: 24upx;
}
.det-item:last-child { border-bottom: none; }
.det-name { font-weight: 600; color: #111827; }
.det-meta { color: #6b7280; }
.record {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 14upx 0;
	border-bottom: 1px solid #eef2f7;
}
.record:last-child { border-bottom: none; }
.record-name { font-size: 25upx; color: #111827; }
.record-time { margin-top: 6upx; font-size: 22upx; color: #6b7280; }
.record-result { font-size: 22upx; border-radius: 999upx; padding: 8upx 14upx; flex-shrink: 0; }
.record-result.good { color: #047857; background: #d1fae5; }
.record-result.normal { color: #b45309; background: #fef3c7; }
.record-result.danger { color: #b91c1c; background: #fee2e2; }
.empty-tip { font-size: 24upx; color: #9ca3af; padding: 12upx 0; }
</style>
