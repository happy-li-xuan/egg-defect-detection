<template>
	<scroll-view scroll-y class="page-scroll">
		<view class="section">
			<view class="section-head">
				<text class="section-title">鸡蛋缺陷检测意义</text>
			</view>
			<view class="hero" hover-class="hero-hover" @click="goDetail(heroTop)">
				<image class="hero-img" mode="aspectFill" :src="heroTop.cover" />
				<view class="hero-gradient" />
				<view class="hero-title-bar">
					<text class="hero-title">{{ heroTop.title }}</text>
				</view>
			</view>
			<home-news-row
				v-for="row in listHeadline"
				:key="row.id"
				:item="row"
				@select="goDetail"
			/>
		</view>

		<view class="section">
			<view class="section-head">
				<text class="section-title">检测知识</text>
			</view>
			<view class="list-card">
				<home-news-row
					v-for="row in listKnowledge"
					:key="row.id"
					:item="row"
					@select="goDetail"
				/>
			</view>
		</view>

		<view class="section section-last">
			<view class="section-head">
				<text class="section-title">设备与产线</text>
			</view>
			<view class="list-card">
				<home-news-row
					v-for="row in listOps"
					:key="row.id"
					:item="row"
					@select="goDetail"
				/>
			</view>
		</view>
	</scroll-view>
</template>

<script>
import HomeNewsRow from '@/components/home-news-row.vue'

const IMG = (seed, w = 800, h = 520) =>
	`https://picsum.photos/seed/${seed}/${w}/${h}`

const commonHtml = (lead, body) =>
	`<p>${lead}</p><p><strong>要点摘要</strong></p><p>${body}</p>`

export default {
	components: { HomeNewsRow },
	data() {
		return {
			heroTop: {
				id: 'h1',
				title: '多光源成像如何提升鸡蛋表面轻微污损检出率',
				cover: IMG('egg-hero', 900, 560),
				author_name: '质检研究院',
				published_at: '26分钟前',
				contentHtml: commonHtml(
					'产线端常见问题是单一顶光会把浅色斑点与蛋壳纹理混在一起。通过补光角度与曝光组合，可以把<strong>对比度</strong>拉开，让模型更稳定。',
					'建议按批次记录光源配置与成像参数，并在换班或换蛋源时做一次快速抽检对照，避免“看得见但模型分不高”的漂移。'
				)
			},
			listHeadline: [
				{
					id: 'a2',
					title: '污损样本入库规范：从拍照到标注字段怎么填',
					cover: IMG('egg-a2', 400, 320),
					author_name: '样本库运营',
					published_at: '1小时前',
					contentHtml: commonHtml(
						'样本质量直接决定上线后的召回表现。入库时除了图片，还应记录批次、产线、光源与缺陷类型等关键字段。',
						'推荐把“难例”单独打标签，并在训练集与验证集之间做同源隔离，减少泄露导致的虚高指标。'
					)
				},
				{
					id: 'a3',
					title: '夜班告警变多？先排查这三类误报来源',
					cover: IMG('egg-a3', 400, 320),
					author_name: '运维值班台',
					published_at: '昨天',
					paragraphs: [
						'告警上升不一定是缺陷真的变多，更多时候来自环境变化：振动导致的虚焦、传送带反光、或相机镜头污渍。',
						'处理顺序建议：先看成像是否发糊，再看曝光是否漂移，最后才调整阈值与模型版本。把每一步记录到工单里，第二天复盘会省很多时间。'
					]
				}
			],
			listKnowledge: [
				{
					id: 'k1',
					title: '推理耗时从 120ms 降到 80ms：我们做了哪些裁剪',
					cover: IMG('egg-k1', 400, 320),
					author_name: 'EggStainNet',
					published_at: '3小时前',
					contentHtml: commonHtml(
						'在边缘算力有限时，优先保证稳定性而不是极限精度。我们通过输入分辨率阶梯试验与算子融合，把端到端耗时明显压下来。',
						'同时保留一份“高质量模式”用于抽检复核，避免产线速度与实验室指标混为一谈。'
					)
				},
				{
					id: 'k2',
					title: '小模型也能用：数据增强里真正有效的几招',
					cover: IMG('egg-k2', 400, 320),
					author_name: '算法组',
					published_at: '5小时前',
					paragraphs: [
						'增强不是越多越好。对鸡蛋这种近似纹理表面，过强的颜色抖动往往带来负收益。',
						'更稳妥的是轻微几何扰动、随机裁切与模拟反光，让模型学会“在不太完美的成像里仍然找得到”。'
					]
				},
				{
					id: 'k3',
					title: '如何把“可解释结果”交给现场班长',
					cover: IMG('egg-k3', 400, 320),
					author_name: '产品体验',
					published_at: '上周',
					contentHtml: commonHtml(
						'现场更需要看得懂的结论：哪一类污损、置信度区间、建议动作（复检/剔除/放行）。',
						'把模型输出映射成固定话术与图示，比直接展示 logits 更能减少争议。'
					)
				}
			],
			listOps: [
				{
					id: 'o1',
					title: '相机安装角度偏移 2° 为什么会让指标掉一截',
					cover: IMG('egg-o1', 400, 320),
					author_name: '设备工程',
					published_at: '2天前',
					paragraphs: [
						'角度偏移会改变高光形状，浅色斑点更容易被高光淹没。对固定工位相机，建议用标定块做周期性检查。',
						'发现偏移后不要只调软件阈值，先把机械与紧固件复位，再重新采集一小批样本做对照。'
					]
				},
				{
					id: 'o2',
					title: '产线换蛋源当天：推荐的复检与回灌流程',
					cover: IMG('egg-o2', 400, 320),
					author_name: '工艺质量',
					published_at: '4天前',
					contentHtml: commonHtml(
						'蛋源变化会带来壳色与纹理分布变化，模型可能需要轻量适配。',
						'当天建议提高抽检比例，把边界样本自动回灌到样本库，并在低峰期触发一次增量训练评估。'
					)
				},
				{
					id: 'o3',
					title: '从单工位到双工位：同步触发与时间对齐注意事项',
					cover: IMG('egg-o3', 400, 320),
					author_name: '系统集成',
					published_at: '1周前',
					paragraphs: [
						'双工位方案里，最常见问题是触发不同步导致“同一只蛋两套图对不上”。',
						'需要统一时钟源、明确主从触发策略，并在软件层做帧对齐校验，异常时自动降级为单工位模式。'
					]
				}
			]
		}
	},
	methods: {
		goDetail(item) {
			try {
				uni.setStorageSync('HOME_ARTICLE_DETAIL', item)
			} catch (e) {
				uni.setStorageSync('HOME_ARTICLE_DETAIL', JSON.parse(JSON.stringify(item)))
			}
			uni.navigateTo({
				url: '/pages/home/article-detail'
			})
		}
	}
}
</script>

<style>
.page-scroll {
	height: 100vh;
	background: #f3f4f6;
	padding: 16upx 0 calc(160upx + env(safe-area-inset-bottom));
	box-sizing: border-box;
}
.section {
	margin: 0 20upx 20upx;
	background: #fff;
	border-radius: 16upx;
	overflow: hidden;
}
.section-last {
	margin-bottom: 32upx;
}
.section-head {
	padding: 22upx 24upx 12upx;
	border-bottom: 1px solid #f3f4f6;
}
.section-title {
	font-size: 30upx;
	font-weight: 700;
	color: #111827;
}
.hero {
	position: relative;
	width: 100%;
	height: 360upx;
	background: #e5e7eb;
}
.hero-hover {
	opacity: 0.96;
}
.hero-img {
	width: 100%;
	height: 100%;
	display: block;
}
.hero-gradient {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 160upx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.92) 55%, #fff 100%);
}
.hero-title-bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 16upx 24upx 20upx;
	background: rgba(255, 255, 255, 0.88);
}
.hero-title {
	font-size: 32upx;
	font-weight: 700;
	color: #111827;
	line-height: 44upx;
}
.list-card {
	overflow: hidden;
}
</style>
