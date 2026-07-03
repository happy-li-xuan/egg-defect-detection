<template>
	<view>
		<view class="banner">
			<image class="banner-img" :src="banner.cover"></image>
			<view class="banner-title">{{ banner.title }}</view>
		</view>
		<view class="article-meta">
			<text class="article-author">{{ banner.author_name }}</text>
			<text class="article-text">发表于</text>
			<text class="article-time">{{ banner.published_at }}</text>
		</view>
		<view class="article-content">
			<rich-text :nodes="htmlString"></rich-text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			banner: {},
			htmlString: ''
		}
	},
	onLoad(event) {
		try {
			this.banner = JSON.parse(decodeURIComponent(event.detailDate))
		} catch (error) {
			this.banner = JSON.parse(event.detailDate || '{}')
		}

		this.getDetail()
		uni.setNavigationBarTitle({
			title: this.banner.title || '详情'
		})
	},
	methods: {
		getDetail() {
			if (!this.banner.post_id) return
			uni.request({
				url: `https://unidemo.dcloud.net.cn/api/news/36kr/${this.banner.post_id}`,
				success: (res) => {
					if (res.statusCode === 200) {
						this.htmlString = (res.data.content || '').replace(/\\/g, '').replace(/<img/g, '<img style="display:none;"')
					}
				}
			})
		}
	}
}
</script>

<style>
view {
	font-size: 28upx;
	line-height: 1.8;
}

.banner {
	height: 360upx;
	overflow: hidden;
	position: relative;
	background-color: #ccc;
}

.banner-img {
	width: 100%;
}

.banner-title {
	max-height: 84upx;
	overflow: hidden;
	position: absolute;
	left: 30upx;
	bottom: 30upx;
	width: 90%;
	font-size: 32upx;
	font-weight: 400;
	line-height: 42upx;
	color: #fff;
	z-index: 11;
}

.article-meta {
	padding: 20upx 40upx;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	color: gray;
}

.article-text {
	font-size: 26upx;
	line-height: 50upx;
	margin: 0 20upx;
}

.article-author,
.article-time {
	font-size: 30upx;
}

.article-content {
	padding: 0 30upx;
	overflow: hidden;
	font-size: 30upx;
	margin-bottom: 30upx;
}
</style>
