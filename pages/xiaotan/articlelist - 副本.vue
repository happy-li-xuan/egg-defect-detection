<template>
	<view>
		<view class="dashboard-card">
			<view class="hero-title">
				鸡蛋品质检测行业现状
			</view>
			<view class="hero-subtitle">
				传统人工检测依赖经验，效率低、漏检率高，
				难以满足规模化智能生产需求
			</view>
			<view class="status-row">
				<view class="status-pill">
					行业痛点分析
				</view>
				<view class="status-pill">
					智能视觉检测需求增长
				</view>
			</view>
		</view>
		<view class="metric-grid">
			<view class="metric-card" v-for="item in metrics" :key="item.label">
				<view class="metric-icon">
					{{item.icon}}
				</view>
				<view class="metric-label">
					{{item.label}}
				</view>
				<view class="metric-value">
					{{item.value}}
				</view>
				<view class="metric-trend">
					{{item.desc}}
				</view>
			</view>
		</view>
		<view class="section-title">
			人工检测 VS 智能视觉检测
		</view>
		<view class="compare-box">
			<view class="compare-item">
				<view class="compare-title">
					传统人工检测
				</view>
				<view class="compare-number">
					2000
					<text>枚/小时</text>
				</view>
				<view class="compare-desc">
					检测效率低
				</view>
			</view>
			<view class="compare-item ai">
				<view class="compare-title">
					AI视觉检测
				</view>
				<view class="compare-number">
					10000+
					<text>枚/小时</text>
				</view>
				<view class="compare-desc">
					高速自动识别
				</view>
			</view>
		</view>
		<view class="problem-card">
			<view class="problem-title">
				当前行业主要问题
			</view>
			<view class="problem-item" v-for="item in problems" :key="item">
				<view class="dot"></view>
				{{item}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				metrics: [{
						icon: '⚠️',
						label: '人工检测效率',
						value: '2000枚/h',
						desc: '高速产线难匹配'
					},
					{
						icon: '❌',
						label: '人工漏检率',
						value: '15%',
						desc: '异常鸡蛋识别不足'
					},
					{
						icon: '💰',
						label: '行业损失',
						value: 'XX亿元',
						desc: '污染与质量问题造成'
					},
					{
						icon: '⏱',
						label: '检测依赖人工',
						value: '90%',
						desc: '自动化程度不足'
					}
				],
				problems: [
					'人工检测依靠视觉经验，检测标准不统一',
					'裂纹、污损、血斑等缺陷容易漏检',
					'高速生产环境下人工无法持续稳定检测',
					'质量追溯和数据管理能力不足'
				]
			}
		}
	}
</script>

<style>
	.dashboard-card {
		margin: 20upx;
		background: linear-gradient(135deg,
				#005bea,
				#00c6fb);
		color: white;
		border-radius: 25upx;
		padding: 30upx;
	}

	.hero-title {
		font-size: 38upx;
		font-weight: bold;
	}

	.hero-subtitle {
		margin-top: 15upx;
		font-size: 26upx;
		line-height: 1.6;
	}
	.status-row {
		display: flex;
		gap: 15upx;
		margin-top: 20upx;
	}
	.status-pill {
		background: rgba(255, 255, 255, .2);
		padding: 10upx 18upx;
		border-radius: 50upx;
		font-size: 22upx;
	}
	.metric-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20upx;
		padding: 20upx;
	}
	.metric-card {
		background: white;
		border-radius: 20upx;
		padding: 25upx;
		box-shadow: 0 5upx 20upx rgba(0, 0, 0, .08);
	}
	.metric-icon {
		font-size: 40upx;
	}
	.metric-label {
		color: #666;
		font-size: 25upx;
		margin-top: 10upx;
	}
	.metric-value {
		font-size: 42upx;
		font-weight: bold;
		color: #111827;
		margin-top: 10upx;
	}
	.metric-trend {
		color: #ef4444;
		margin-top: 10upx;
	}
	.section-title {
		font-size: 32upx;
		font-weight: bold;
		padding: 20upx;
	}
	.compare-box {
		display: flex;
		padding: 20upx;
		gap: 20upx;
	}
	.compare-item {
		flex: 1;
		background: #f3f4f6;
		border-radius: 20upx;
		padding: 30upx;
		text-align: center;
	}
	.compare-item.ai {
		background: #dbeafe;
	}
	.compare-title {
		font-size: 28upx;
	}
	.compare-number {
		font-size: 48upx;
		font-weight: bold;
		margin: 20upx 0;
	}
	.compare-number text {
		font-size: 24upx;
	}
	.compare-desc {
		color: #666;
	}
	.problem-card {
		margin: 20upx;
		background: white;
		border-radius: 20upx;
		padding: 25upx;
		height: 400rpx;
	}
	.problem-title {
		font-size: 30upx;
		font-weight: bold;
		margin-bottom: 20upx;
	}
	.problem-item {
		display: flex;
		align-items: center;
		margin-bottom: 20upx;
		color: #555;
		font-size: 26upx;
	}
	.dot {
		width: 14upx;
		height: 14upx;
		background: #2563eb;
		border-radius: 50%;
		margin-right: 15upx;
	}
</style>