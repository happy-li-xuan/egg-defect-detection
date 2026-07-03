<template>
	<!-- 我的页面 -->
	<view class="page">
		<view class="warn-card critical">
			<view class="warn-head">
				<text class="level">一级预警</text>
				<text class="time">2 分钟前</text>
			</view>
			<view class="warn-title">清洗线 2 号区域污损率突增</view>
			<view class="warn-desc">近 15 分钟污损率 7.8%，超阈值 4.0%，建议立即人工巡检。</view>
		</view>

		<view class="warn-card" v-for="item in notices" :key="item.id">
			<view class="warn-head">
				<text class="tag">{{ item.tag }}</text>
				<text class="time">{{ item.time }}</text>
			</view>
			<view class="warn-title">{{ item.title }}</view>
			<view class="warn-desc">{{ item.desc }}</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			notices: [
				{
					id: 1,
					tag: '模型通知',
					time: '今天 09:50',
					title: 'EggStainNet v2.2 可灰度发布',
					desc: '新模型在验证集上的 F1 提升 2.3%，建议在 1 号线先灰度测试。'
				},
				{
					id: 2,
					tag: '设备通知',
					time: '今天 08:30',
					title: '相机 CAM-03 已恢复在线',
					desc: '网络抖动已恢复，建议补采 08:10-08:25 期间样本。'
				}
			]
		}
	}
}
</script>

<style>
.page { padding: 24upx; padding-bottom: 160upx; background: #f4f7fc; min-height: 100vh; }
.warn-card { background: #fff; border-radius: 16upx; padding: 20upx; margin-bottom: 16upx; border-left: 8upx solid #60a5fa; }
.warn-card.critical { border-left-color: #ef4444; background: #fff5f5; }
.warn-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8upx; }
.level { color: #b91c1c; font-size: 24upx; font-weight: 700; }
.tag { color: #1d4ed8; font-size: 23upx; }
.time { color: #6b7280; font-size: 22upx; }
.warn-title { font-size: 29upx; color: #111827; font-weight: 600; }
.warn-desc { margin-top: 8upx; font-size: 24upx; color: #4b5563; line-height: 1.5; }
</style>
