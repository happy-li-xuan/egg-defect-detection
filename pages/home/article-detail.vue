<template>
	<view class="page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-inner">
				<view class="back" @click="onBack">
					<text class="back-icon">‹</text>
				</view>
			</view>
		</view>
		<scroll-view scroll-y class="scroll">
			<view class="banner-wrap">
				<image class="banner-img" mode="aspectFill" :src="article.cover" />
				<view class="banner-mask" />
				<text class="banner-title">{{ article.title }}</text>
			</view>
			<view class="article-meta">
				<text class="meta-source">{{ article.author_name }}</text>
				<text class="meta-gap">·</text>
				<text class="meta-label">发表于</text>
				<text class="meta-time">{{ article.published_at }}</text>
			</view>
			<view class="article-body">
				<rich-text v-if="htmlString" :nodes="htmlString"></rich-text>
				<view v-else class="plain-fallback">
					<view class="p" v-for="(para, idx) in plainParagraphs" :key="idx">{{ para }}</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
const STORAGE_KEY = 'HOME_ARTICLE_DETAIL'

export default {
	data() {
		return {
			statusBarHeight: 20,
			article: {
				title: '',
				cover: '',
				author_name: '',
				published_at: ''
			},
			htmlString: '',
			plainParagraphs: []
		}
	},
	onLoad() {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20

		let raw = uni.getStorageSync(STORAGE_KEY)
		if (typeof raw === 'string') {
			try {
				raw = JSON.parse(raw)
			} catch (e) {
				raw = {}
			}
		}
		if (!raw || !raw.title) {
			uni.showToast({ title: '内容不存在', icon: 'none' })
			return
		}
		this.article = {
			title: raw.title,
			cover: raw.cover,
			author_name: raw.author_name || '',
			published_at: raw.published_at || '',
			post_id: raw.post_id
		}
		if (raw.contentHtml) {
			this.htmlString = raw.contentHtml
		} else if (raw.post_id) {
			this.fetchRemote(raw.post_id)
		} else if (Array.isArray(raw.paragraphs) && raw.paragraphs.length) {
			this.plainParagraphs = raw.paragraphs
		} else {
			this.plainParagraphs = ['暂无正文。']
		}
	},
	onUnload() {
		try {
			uni.removeStorageSync(STORAGE_KEY)
		} catch (e) {}
	},
	methods: {
		onBack() {
			uni.navigateBack({ delta: 1 })
		},
		fetchRemote(postId) {
			uni.request({
				url: `https://unidemo.dcloud.net.cn/api/news/36kr/${postId}`,
				success: (res) => {
					if (res.statusCode === 200 && res.data && res.data.content) {
						this.htmlString = (res.data.content || '')
							.replace(/\\/g, '')
							.replace(/<img/g, '<img style="max-width:100%;height:auto;display:block;"')
					} else {
						this.plainParagraphs = ['暂时无法加载远程正文。']
					}
				},
				fail: () => {
					this.plainParagraphs = ['网络异常，请稍后重试。']
				}
			})
		}
	}
}
</script>

<style>
.page {
	background: #fff;
	min-height: 100vh;
}
.nav-bar {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	z-index: 100;
	background: transparent;
}
.nav-inner {
	height: 44px;
	display: flex;
	align-items: center;
	padding-left: 8px;
}
.back {
	width: 40px;
	height: 40px;
	border-radius: 20px;
	background: rgba(0, 0, 0, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
}
.back-icon {
	color: #fff;
	font-size: 28px;
	line-height: 1;
	margin-top: -4px;
}
.scroll {
	box-sizing: border-box;
	height: 100vh;
	width: 100%;
}
.banner-wrap {
	position: relative;
	width: 100%;
	height: 420upx;
	overflow: hidden;
	background: #d1d5db;
}
.banner-img {
	width: 100%;
	height: 100%;
}
.banner-mask {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 160upx;
	background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 100%);
}
.banner-title {
	position: absolute;
	left: 28upx;
	right: 28upx;
	bottom: 28upx;
	font-size: 36upx;
	font-weight: 600;
	color: #fff;
	line-height: 48upx;
	z-index: 2;
}
.article-meta {
	padding: 24upx 28upx;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	color: #9ca3af;
	font-size: 26upx;
}
.meta-source {
	color: #6b7280;
}
.meta-gap {
	margin: 0 8upx;
}
.meta-label {
	margin-right: 8upx;
}
.article-body {
	padding: 0 28upx 48upx;
	font-size: 30upx;
	line-height: 1.85;
	color: #374151;
}
.plain-fallback {
	display: flex;
	flex-direction: column;
	gap: 20upx;
}
.p {
	display: block;
}
</style>
