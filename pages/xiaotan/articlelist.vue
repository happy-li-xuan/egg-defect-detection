<template>
	<view>
		<!-- 管理页面 -->
		<view class="top-card">
			<view class="title">鸡蛋品质检测行业现状</view>
			<view class="sub-title">
				传统人工检测依赖经验，效率低、漏检率高，难以满足规模化生产需求
			</view>
			<view class="tags">
				<view class="tag">行业痛点分析</view>
				<view class="tag">智能检测趋势</view>
			</view>
		</view>
		<view class="data-box">
			<view class="data-item" v-for="item in metrics" :key="item.label">
				<view class="icon">{{item.icon}}</view>
				<view class="label">{{item.label}}</view>
				<view class="num">{{item.value}}</view>
				<view class="desc">{{item.desc}}</view>
			</view>
		</view>
		<view class="title-bar">
			人工检测与智能视觉检测对比
		</view>
		<view class="compare">
			<view class="compare-item">
				<view>传统人工检测</view>
				<view class="big-num">
					2000<text>枚/小时</text>
				</view>
				<view class="desc">检测速度受人工影响</view>
			</view>
			<view class="compare-item ai">
				<view>AI视觉检测</view>
				<view class="big-num">
					10000+<text>枚/小时</text>
				</view>
				<view class="desc">自动识别，连续运行</view>
			</view>
		</view>
		<view class="problem">
			<view class="problem-title">当前行业主要问题</view>

			<view class="problem-row" v-for="item in problems" :key="item">
				<view class="point"></view>
				<text>{{item}}</text>
			</view>
		</view>
	</view>
</template>


<script>
export default {
	data() {
		return {
			metrics:[
				{
					icon:'⚠️',
					label:'人工检测效率',
					value:'2000枚/h',
					desc:'难匹配高速产线'
				},
				{
					icon:'❌',
					label:'人工漏检率',
					value:'15%',
					desc:'异常缺陷容易遗漏'
				},
				{
					icon:'💰',
					label:'质量损失',
					value:'XX亿元',
					desc:'污染问题造成经济损失'
				},
				{
					icon:'⏱',
					label:'人工依赖度',
					value:'90%',
					desc:'自动化水平不足'
				}
			],

			problems:[
				'检测标准依赖人工经验，结果存在差异',
				'裂纹、污损、血斑等缺陷容易漏检',
				'高速生产环境下人工难以持续检测',
				'缺少检测数据记录与质量追踪'
			]
		}
	}
}
</script>


<style>
.top-card{
	margin:20upx;
	padding:30upx;
	border-radius:22upx;
	background:linear-gradient(135deg,#1468ff,#00bfff);
	color:#fff;
}
.title{
	font-size:36upx;
	font-weight:bold;
}
.sub-title{
	margin-top:12upx;
	font-size:25upx;
	line-height:1.5;
}
.tags{
	display:flex;
	gap:15upx;
	margin-top:18upx;
}

.tag{
	background:rgba(255,255,255,.25);
	padding:8upx 16upx;
	border-radius:30upx;
	font-size:22upx;
}

.data-box{
	display:grid;
	grid-template-columns:repeat(2,1fr);
	gap:18upx;
	padding:20upx;
}
.data-item{
	background:#fff;
	padding:22upx;
	border-radius:18upx;
	box-shadow:0 4upx 15upx rgba(0,0,0,.08);
}
.icon{
	font-size:38upx;
}

.label{
	margin-top:8upx;
	color:#666;
	font-size:24upx;
}
.num{
	margin-top:10upx;
	font-size:38upx;
	font-weight:bold;
	color:#111;
}

.desc{
	margin-top:8upx;
	font-size:22upx;
	color:#ef4444;
}

.title-bar{
	padding:20upx;
	font-size:30upx;
	font-weight:bold;
}
.compare{
	display:flex;
	gap:18upx;
	padding:0 20upx;
}


.compare-item{
	flex:1;
	padding:25upx;
	background:#f5f6f8;
	border-radius:18upx;
	text-align:center;
}


.compare-item.ai{
	background:#dbeafe;
}


.big-num{
	margin:18upx 0;
	font-size:42upx;
	font-weight:bold;
}


.big-num text{
	font-size:22upx;
	font-weight:normal;
}

.problem{
	margin:20upx;
	background:#fff;
	border-radius:18upx;
	padding:25upx;
	height: 400rpx;
}
.problem-title{
	font-size:30upx;
	font-weight:bold;
	margin-bottom:20upx;
}
.problem-row{
	display:flex;
	align-items:center;
	margin-bottom:18upx;
	font-size:25upx;
	color:#555;
}
.point{
	width:12upx;
	height:12upx;
	border-radius:50%;
	background:#2563eb;
	margin-right:15upx;
}
</style>