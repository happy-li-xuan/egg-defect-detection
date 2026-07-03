<template>
	<view class="page">
		<view class="hero">
			<view class="hero-badge">服务中心</view>
			<view class="hero-title">鸡蛋缺损检测知识与支持</view>
			<view class="hero-desc">常见问题、检测小贴士与AI智能问答，帮助您更快上手质检流程。</view>
		</view>
		<view class="block">
			<view class="block-title">常见问题</view>
			<view class="faq-item" v-for="(item, index) in faqs" :key="index">
				<view class="faq-q" @click="toggleFaq(index)">
					<text class="faq-q-text">{{ item.q }}</text>
					<text class="faq-arrow">{{ item.open ? '▲' : '▼' }}</text>
				</view>
				<view v-if="item.open" class="faq-a">{{ item.a }}</view>
			</view>
		</view>

		<view class="block">
			<view class="block-title">检测知识速览</view>
			<view class="know-lead">以下为现场质检常用知识点，可直接对照本页调整相机、阈值与分拣策略。</view>
			<view class="know-sec" v-for="(sec, i) in knowledgeSections" :key="i">
				<view class="know-sec-head">
					<text class="know-dot" />
					<text class="know-sec-title">{{ sec.title }}</text>
				</view>
				<view v-if="sec.items && sec.items.length" class="know-list">
					<view class="know-li" v-for="(line, j) in sec.items" :key="j">
						<text class="know-li-mark">·</text>
						<text class="know-li-txt">{{ line }}</text>
					</view>
				</view>
				<view v-if="sec.body" class="know-body">{{ sec.body }}</view>
			</view>
		</view>

		<view class="block ai-block">
			<view class="ai-head">
				<view>
					<view class="block-title ai-title">AI 智能问答</view>
					<view class="ai-sub">基于大模型 API，支持流式回答。</view>
				</view>
				<button class="ai-clear" size="mini" @click="clearChat">清空</button>
			</view>
			<scroll-view class="ai-scroll" scroll-y :scroll-into-view="scrollIntoView" scroll-with-animation>
				<view
					v-for="m in chatMessages"
					:key="m.id"
					:id="'msg-' + m.id"
					:class="['ai-row', m.role]"
				>
					<view class="ai-bubble">
						<text class="ai-role">{{ m.role === 'user' ? '我' : 'AI' }}</text>
						<text class="ai-text">{{ m.text || (m.id === streamingMsgId ? '…' : '') }}</text>
					</view>
				</view>
				<view v-if="chatLoading && !streamingMsgId" id="msg-typing" class="ai-row assistant">
					<view class="ai-bubble typing">
						<text class="ai-role">AI</text>
						<text class="ai-text">正在组织回答…</text>
					</view>
				</view>
				<view class="ai-scroll-bottom" />
			</scroll-view>
			<view class="ai-input-wrap">
				<input
					class="ai-input"
					v-model="chatInput"
					type="text"
					confirm-type="send"
					placeholder="例如：阴影误判怎么办？"
					:disabled="chatLoading"
					@confirm="sendChat"
				/>
				<button class="ai-send" :disabled="chatLoading" @click="sendChat">发送</button>
			</view>
		</view>

		<view class="account-bar">
			<view>
				<view class="account-name">{{ userLabel }}</view>
				<view class="account-meta">登录后可同步工单与历史会话</view>
			</view>
			<button class="ghost-btn" size="mini" @click="logout">退出登录</button>
		</view>
	</view>
</template>

<script>
import { askAiChat, askAiChatStream, AI_CHAT_CONFIG } from '@/common/aiChat.js'

let chatIdSeq = 100

export default {
	data() {
		return {
			userLabel: '农场质检管理员',
			scrollIntoView: '',
			chatInput: '',
			chatLoading: false,
			streamingMsgId: null,
			chatAbortController: null,
			chatMessages: [],
			knowledgeSections: [
				{
					title: '模型输出字段说明',
					items: [
						'检测类别：模型对蛋壳表面给出的缺陷类型标签（如污渍、破损、正常等），用于统计与分拣口映射。',
						'置信度：模型对当前判断的确信程度，取值一般在 0–1。越高表示模型越「有把握」，但仍需结合现场光照与传送带震动评估。',
						'建议等级：在业务规则里把模型输出映射为「合格 / 人工复核 / 剔除」等等级，便于 PLC 或分拣执行机构直接消费。'
					]
				},
				{
					title: '裂纹与暗斑',
					body:
						'裂纹通常表现为细长、高对比边缘，可能伴随蛋壳反光断裂；暗斑多为片状、颜色偏深但边缘相对柔和。现场若背光不足，暗斑与脏污容易混淆，可适当提高侧向补光或微调曝光。对疑似裂纹建议走人工复核通道，避免碎壳进入下游包装。'
				},
				{
					title: '光照与阴影',
					body:
						'强烈点光源会在蛋体曲面形成高光与阴影带，易被模型误认为污损。做法是：改用漫反射灯罩、增加顶部柔光条、固定蛋体姿态（例如小头朝下滚动稳定）。背景色尽量与蛋壳对比适中，避免纯黑纯白极端背景造成阈值漂移。'
				},
				{
					title: '阈值调参',
					body:
						'常用做法是：先以验证集统计误报/漏报曲线，再选「可接受误杀率」对应的置信度阈值。若近期蛋壳颜色批次变化大，可略降阈值并加大复核比例；产线稳定后可逐步提高阈值以提升产能。改动阈值后务必记录版本号与生效时间，便于追溯。'
				},
				{
					title: '批次追溯',
					body:
						'建议每次上料切换批次时，在系统内登记批次号、供应商、上料时间，并与相机时间戳对齐。单枚异常可回看该枚的裁切图、热力图（若有）与当时的设备状态（相机编号、光源档位），快速判断是偶发污渍还是设备偏移。'
				}
			],
			faqs: [
				{
					open: false,
					q: '系统说的「鸡蛋缺损检测」具体包含哪些类型？',
					a: '当前版本主要针对蛋壳表面可见缺陷：污渍、破损、正常等。内部品质（如散黄）需配合其他抽检手段，本模块以图像视觉为主。'
				},
				{
					open: true,
					q: '结果里的「置信度」是什么意思？该怎么用？',
					a: '置信度表示模型对当前框选区域判断为某类缺陷的确信程度，范围 0–1。一般建议：高于产线设定阈值（如 0.65）再自动分拣；介于边界时可改为人工复核，降低误杀与漏检。'
				},
				{
					open: false,
					q: '强光或阴影会不会被误判成污损？',
					a: '会存在风险。请尽量保证光源均匀、避免局部过曝；相机固定角度与背景色一致可显著提升稳定性。若现场条件受限，可在服务里申请「场景标定」协助调参。'
				},
				{
					open: false,
					q: '多久会更新一次模型？旧版本还能用吗？',
					a: '主模型按季度规划迭代，紧急缺陷类型可插队小版本。控制台保留可回滚的历史版本，便于对比新模型在您产线上的实际效果。'
				},
				{
					open: false,
					q: '边缘端离线检测和上传云端有什么区别？',
					a: '离线适合低时延、弱网环境，规则在盒子内闭环；云端适合多厂区统一策略、远程运维与大数据看板。两者可混合部署，由实施顾问按您的网络与数据合规要求设计。'
				}
			]
		}
	},
	onShow() {
		const u = uni.getStorageSync('authUser')
		if (u && typeof u === 'object' && u.name) {
			this.userLabel = u.name
		} else if (typeof u === 'string' && u) {
			this.userLabel = u
		}
	},
	methods: {
		toggleFaq(index) {
			const item = this.faqs[index]
			item.open = !item.open
		},
		
		
		clearChat() {
			if (this.chatAbortController) {
				this.chatAbortController.abort()
				this.chatAbortController = null
			}
			this.chatLoading = false
			this.streamingMsgId = null
			this.chatMessages = []
			this.scrollChatToEnd()
		},
		async sendChat() {
			const text = (this.chatInput || '').trim()
			if (!text || this.chatLoading) return
			this.chatInput = ''
			this.chatMessages.push({ id: ++chatIdSeq, role: 'user', text })

			const assistantMsg = { id: ++chatIdSeq, role: 'assistant', text: '' }
			this.chatMessages.push(assistantMsg)
			this.streamingMsgId = assistantMsg.id
			this.chatLoading = true

			const history = this.chatMessages.slice(0, -2)
			const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
			this.chatAbortController = controller

			this.$nextTick(() => this.scrollChatToEnd())

			try {
				const opts = { signal: controller?.signal }
				if (AI_CHAT_CONFIG.stream) {
					await askAiChatStream({
						message: text,
						history,
						...opts,
						onMessage: (delta) => {
							assistantMsg.text += delta
							this.scrollChatToEnd()
						}
					})
				} else {
					assistantMsg.text = await askAiChat({ message: text, history, ...opts })
				}
				if (!assistantMsg.text.trim()) {
					assistantMsg.text = '未收到有效回复，请重试。'
				}
			} catch (e) {
				assistantMsg.text = e && e.message ? e.message : '请求失败，请稍后重试'
			} finally {
				this.chatLoading = false
				this.streamingMsgId = null
				this.chatAbortController = null
				this.$nextTick(() => this.scrollChatToEnd())
			}
		},
		scrollChatToEnd() {
			this.$nextTick(() => {
				this.scrollIntoView = ''
				this.$nextTick(() => {
					if (this.chatLoading && !this.streamingMsgId) {
						this.scrollIntoView = 'msg-typing'
					} else {
						const last = this.chatMessages[this.chatMessages.length - 1]
						if (last) this.scrollIntoView = 'msg-' + last.id
					}
				})
			})
		},
		logout() {
			uni.removeStorageSync('authUser')
			uni.reLaunch({
				url: '/pages/auth/login'
			})
		}
	}
}
</script>

<style>
.page {
	padding: 24rpx;
	padding-bottom: 160rpx;
	min-height: 100vh;
	background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
}

.hero {
	background: linear-gradient(135deg, #4f46e5, #6366f1);
	color: #fff;
	border-radius: 24rpx;
	padding: 32rpx 26rpx;
	box-shadow: 0 20rpx 40rpx rgba(79, 70, 229, 0.25);
	height: 5rem;
}

.hero-badge {
	display: inline-block;
	font-size: 22rpx;
	padding: 6rpx 18rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.2);
	margin-bottom: 16rpx;
	backdrop-filter: blur(10rpx);
}

.hero-title {
	font-size: 36rpx;
	font-weight: 700;
	line-height: 1.4;
}

.hero-desc {
	margin-top: 12rpx;
	font-size: 24rpx;
	opacity: 0.9;
	line-height: 1.6;
}

.quick-grid {
	margin-top: 22rpx;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.quick-item {
	width: 48%;
	background: #fff;
	border-radius: 20rpx;
	padding: 22rpx 18rpx;
	margin-bottom: 18rpx;
	box-sizing: border-box;
	box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.06);
	transition: all 0.2s;
}

.quick-item:active {
	transform: scale(0.97);
	box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.1);
}

.quick-icon {
	font-size: 40rpx;
	margin-bottom: 10rpx;
}

.quick-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #111827;
}

.quick-sub {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #6b7280;
}

.block {
	margin-top: 10rpx;
	background: #fff;
	border-radius: 20rpx;
	padding: 24rpx 20rpx;
	margin-bottom: 18rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}

.block-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #111827;
	margin-bottom: 16rpx;
}

.service-line {
	padding: 14rpx 0;
	border-bottom: 1px solid #f1f5f9;
}

.service-line:last-of-type {
	border-bottom: none;
}

.label {
	font-size: 24rpx;
	color: #6b7280;
}

.value {
	font-size: 26rpx;
	color: #1f2937;
	margin-top: 4rpx;
}

.faq-item {
	border-bottom: 1px solid #f1f5f9;
	padding: 16rpx 0;
}

.faq-q {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.faq-q-text {
	flex: 1;
	font-size: 26rpx;
	color: #111827;
	font-weight: 500;
	line-height: 1.5;
}

.faq-arrow {
	font-size: 22rpx;
	color: #9ca3af;
}

.faq-a {
	margin-top: 12rpx;
	padding: 16rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	font-size: 24rpx;
	color: #4b5563;
	line-height: 1.6;
}

.know-lead {
	font-size: 24rpx;
	color: #6b7280;
	line-height: 1.55;
	margin-bottom: 20rpx;
}

.know-sec {
	margin-bottom: 22rpx;
	padding-bottom: 20rpx;
	border-bottom: 1px solid #f1f5f9;
}

.know-sec:last-child {
	border-bottom: none;
	margin-bottom: 0;
	padding-bottom: 0;
}

.know-sec-head {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.know-dot {
	width: 8rpx;
	height: 28rpx;
	border-radius: 4rpx;
	background: linear-gradient(180deg, #6366f1, #a5b4fc);
	flex-shrink: 0;
}

.know-sec-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #1e1b4b;
}

.know-list {
	padding-left: 4rpx;
}

.know-li {
	display: flex;
	gap: 10rpx;
	margin-bottom: 10rpx;
	font-size: 24rpx;
	color: #374151;
	line-height: 1.55;
}

.know-li-mark {
	color: #6366f1;
	flex-shrink: 0;
}

.know-li-txt {
	flex: 1;
}

.know-body {
	font-size: 24rpx;
	color: #4b5563;
	line-height: 1.65;
}

.ai-block {
	padding-bottom: 20rpx;
}

.ai-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.ai-title {
	margin-bottom: 8rpx;
}

.ai-sub {
	font-size: 22rpx;
	color: #6b7280;
	line-height: 1.5;
	max-width: 520rpx;
}

.ai-clear {
	margin: 0;
	flex-shrink: 0;
	background: #f3f4f6;
	color: #4b5563;
	font-size: 22rpx;
	border-radius: 999rpx;
}

.ai-scroll {
	max-height: 520rpx;
	min-height: 280rpx;
	margin-bottom: 16rpx;
	padding-right: 4rpx;
}

.ai-scroll-bottom {
	height: 8rpx;
}

.ai-row {
	display: flex;
	margin-bottom: 16rpx;
}

.ai-row.user {
	justify-content: flex-end;
}

.ai-row.assistant {
	justify-content: flex-start;
}

.ai-bubble {
	max-width: 85%;
	padding: 16rpx 18rpx;
	border-radius: 16rpx;
}

.ai-row.user .ai-bubble {
	background: linear-gradient(135deg, #4f46e5, #6366f1);
}

.ai-row.assistant .ai-bubble {
	background: #f1f5f9;
}

.ai-bubble.typing {
	opacity: 0.92;
}

.ai-role {
	display: block;
	font-size: 20rpx;
	margin-bottom: 6rpx;
	opacity: 0.85;
}

.ai-row.user .ai-role,
.ai-row.user .ai-text {
	color: #fff;
}

.ai-row.assistant .ai-role {
	color: #6366f1;
}

.ai-row.assistant .ai-text {
	color: #1f2937;
}

.ai-text {
	font-size: 24rpx;
	line-height: 1.55;
	white-space: pre-wrap;
	word-break: break-word;
}

.ai-input-wrap {
	display: flex;
	align-items: center;
	gap: 12rpx;
	background: #f8fafc;
	border-radius: 999rpx;
	padding: 8rpx 8rpx 8rpx 22rpx;
	border: 1px solid #e2e8f0;
}

.ai-input {
	flex: 1;
	font-size: 26rpx;
	height: 64rpx;
	line-height: 64rpx;
}

.ai-send {
	margin: 0;
	flex-shrink: 0;
	background: linear-gradient(135deg, #4f46e5, #6366f1);
	color: #fff;
	font-size: 26rpx;
	border-radius: 999rpx;
	padding: 0 28rpx;
	height: 64rpx;
	line-height: 64rpx;
}

.ai-send[disabled] {
	opacity: 0.55;
}

.account-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #fff;
	border-radius: 20rpx;
	padding: 20rpx 18rpx;
	margin-top: 10rpx;
	box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.05);
}

.account-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #111827;
}

.account-meta {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #9ca3af;
}

.ghost-btn {
	margin: 0;
	background: linear-gradient(135deg, #eef2ff, #e0e7ff);
	color: #4338ca;
	border-radius: 999rpx;
	font-size: 24rpx;
	padding: 10rpx 20rpx;
}

.ghost-btn:active {
	transform: scale(0.95);
}
</style>
