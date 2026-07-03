<template>
	<scroll-view scroll-y class="page-scroll">
		<!-- 首页 -->
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
				<text class="section-title">检测分类</text>
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

		<!-- <view class="section section-last">
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
		</view> -->
	</scroll-view>
</template>

<script>
import HomeNewsRow from '@/components/home-news-row.vue'

const IMG = (name) => `/static/home/${name}.jpg`

const commonHtml = (lead, ...list) => {
	return `
		<p>${lead}</p>
		<p><strong>主要内容</strong></p>
		${list.map(item => `<p>${item}</p>`).join('')}
	`
}

export default {
	components: { HomeNewsRow },
	data() {
		return {
			heroTop: {
				id: 'h1',
				title: '鸡蛋缺陷检测在农业、食品加工、质量控制及消费者安全等领域具有深远意义',
				cover: IMG('egg', 900, 560),
				author_name: '质检研究院',
				published_at: '26分钟前',
				contentHtml: commonHtml(
				    '鸡蛋缺陷检测在农业、食品加工、质量控制及消费者安全等领域具有深远意义，其核心价值体现在保障产品质量、提升生产效率、维护品牌信誉及满足市场需求等多个层面。',
					'1.保障食品安全：检测缺陷蛋可防止有害物质（如细菌、霉菌毒素）进入食品链，降低消费者健康风险。',
					'2.降低经济损失：提前剔除问题蛋，避免退货、索赔及品牌声誉受损，保护企业利润。',
					'3.提升生产效率：自动化检测技术（如机器视觉）实现高速分拣，减少人工成本并提高产能。',
					'4.优化养殖管理：通过缺陷数据反馈，调整饲养环境或饲料配方，减少缺陷蛋产生，提升产蛋质量。',
					'5.满足分级需求：根据蛋壳完整性、新鲜度等指标分级，适应不同市场（如高端餐饮、零售）的差异化需求。',
					'6.增强消费者信任：透明化检测流程提升品牌信誉，尤其在电商和出口市场中更具竞争力。',
					'7.突破贸易壁垒：符合国际质量标准（如USDA、JAS），确保出口鸡蛋顺利通关，避免被拒收或销毁。',
					'8.促进资源循环：优质蛋用于食品加工，缺陷蛋转化为饲料或生物燃料，减少废弃物处理压力。',
					'9.推动技术创新：检测技术（如深度学习、光谱分析）的应用推动养殖业向数字化、智能化转型。',
					'10.支持可持续发展：减少因缺陷蛋导致的资源浪费，降低环境影响，符合绿色农业趋势。'
				)
			},
			listHeadline: [
				{
					id: 'a2',
					title: '别小看鸡蛋缺陷检测，它能帮企业和消费者躲开好多“坑”',
					cover: IMG('egg-yi1', 400, 320),
					author_name: '样本库运营',
					published_at: '1小时前',
					contentHtml: commonHtml(
						'鸡蛋缺陷检测对企业可避损失、护品牌，对消费者能防健康风险、保口感，是躲“坑”关键。',
						'1.对企业而言：在生产环节，若缺陷鸡蛋未被及时检测出来，一旦进入加工流程，可能会污染其他正常鸡蛋或加工设备，导致设备故障、产品批次报废，增加维修成本和生产损耗。而且，带有缺陷的鸡蛋制成食品后，会影响产品口感与品质，损害品牌形象，使消费者失去信任，进而减少产品销量。在销售环节，若消费者购买到有缺陷的鸡蛋，如变质、有异味等，很可能会向商家投诉或要求退货，商家不仅要承担经济损失，还可能面临监管部门的处罚。鸡蛋缺陷检测能有效避免这些情况，让企业生产销售更顺畅。',
						'2.对消费者来说：没有经过检测的鸡蛋，可能存在沙门氏菌污染、农药残留超标等安全隐患。消费者食用后，可能会出现腹痛、腹泻、呕吐等食物中毒症状，严重危害身体健康。此外，像血斑蛋、肉斑蛋等缺陷蛋，不仅外观不佳，口感也较差。通过缺陷检测，消费者能购买到品质有保障的鸡蛋，吃得安心、放心，躲开这些健康和口感上的“坑”。'
					)
				},
				{
					id: 'a3',
					title: '鸡蛋缺陷检测有啥用？保品质、省成本，好处可不少！',
					cover: IMG('egg-yi2', 400, 320),
					author_name: '运维值班台',
					published_at: '昨天',
					paragraphs: [
						'鸡蛋缺陷检测既能严格把关保品质，又能从多环节省成本，为企业和消费带来诸多实在好处。',
						'1.保品质：鸡蛋缺陷检测可以对鸡蛋的大小、形状、蛋壳完整性、内部质量等多个方面进行精准检测。通过严格筛选，只有符合高品质标准的鸡蛋才能进入市场。例如，能检测出蛋壳上有细微裂纹的鸡蛋，避免其在运输和储存过程中因细菌侵入而变质；还能识别出内部有血斑、肉斑的鸡蛋，保证消费者买到的鸡蛋内部干净、新鲜，整体提升了鸡蛋的品质水平。',
						'2.省成本：从生产源头看，及时检测出缺陷鸡蛋，可减少后续加工过程中因问题蛋导致的设备损耗、原料浪费等情况，降低生产成本。在运输和储存环节，由于缺陷蛋更容易损坏和变质，检测后剔除这些蛋，能减少运输过程中的损耗以及储存时的浪费，节省物流和仓储成本。对于销售企业，高品质的鸡蛋更受消费者欢迎，能提高销售量和利润，同时减少因质量问题产生的售后成本，如退货、赔偿等。'
					]
				},
				{
					id: 'a4',
					title: '为啥要做鸡蛋缺陷检测？这是保障咱吃到好蛋的重要一步！',
					cover: IMG('egg-yi3', 400, 320),
					author_name: '运维值班台',
					published_at: '昨天',
					paragraphs: [
						'鸡蛋缺陷检测可保障食品安全、提升消费体验，是确保消费者吃到新鲜优质鸡蛋的重要举措。',
						'1.确保食品安全：鸡蛋在生产过程中可能受到各种污染，如鸡舍环境中的细菌、饲料中的有害物质等。缺陷鸡蛋更容易成为细菌滋生的温床，例如蛋壳破损的鸡蛋，细菌会迅速侵入内部，导致鸡蛋变质，甚至产生毒素。通过缺陷检测，可以将这些受污染的鸡蛋及时剔除，防止其流入市场，保障消费者不会因食用受污染的鸡蛋而引发食品安全问题，守护人们的身体健康。',
						'2.提升消费体验：消费者在购买鸡蛋时，都希望能买到新鲜、完整、内部质量好的鸡蛋。鸡蛋缺陷检测能够保证进入市场的鸡蛋在外观和内在品质上都符合一定标准。比如，保证鸡蛋大小均匀、蛋壳光滑无破损、蛋黄饱满等，让消费者在烹饪和食用过程中获得更好的体验，满足人们对高品质食品的需求，真正让消费者吃到“好蛋”'
					]
				}
			],
			listKnowledge: [
				{
					id: 'k1',
					title: '明辨优品：正常鸡蛋检测的意义',
					cover: IMG('egg4', 400, 320),
					author_name: 'EggStainNet',
					published_at: '3小时前',
					contentHtml: commonHtml(
						'正常鸡蛋检测保障高品质供应，提升企业形象与市场效益，是市场稳定与企业发展的基石。',
						'1.对市场供应而言，准确检测出正常鸡蛋，能确保流入市场的产品具备高品质，满足消费者对于新鲜、完整、内部质量优良鸡蛋的需求，维护市场正常秩序。',
						'2.从企业角度，有助于企业树立良好的品牌形象，提高消费者信任度，增强市场竞争力，进而提升产品销量和经济效益。'
					)
				},
				{
					id: 'k2',
					title: '剔除隐患：破损鸡蛋检测的意义',
					cover: IMG('egg1', 400, 320),
					author_name: '算法组',
					published_at: '5小时前',
					paragraphs: [
						'破损鸡蛋检测守护食品安全，保障生产流程顺畅，是食品质量与生产效益的重要防线。',
						'1.在食品安全方面，破损鸡蛋蛋壳失去保护作用，细菌易侵入导致鸡蛋变质，检测并剔除可防止变质鸡蛋进入食品加工或销售环节，避免消费者食用后出现食物中毒等健康问题。',
						'2.就生产流程而言，及时检测出破损鸡蛋能避免其在运输、加工过程中污染其他正常鸡蛋和设备，减少生产损耗和设备故障，降低生产成本。'
					]
				},
				{
					id: 'k3',
					title: '保障洁净：脏污鸡蛋检测的意义',
					cover: IMG('egg3', 400, 320),
					author_name: '产品体验',
					published_at: '上周',
					contentHtml: commonHtml(
						'脏污鸡蛋检测维护公众健康，提升产品外观品质与市场接受度，是鸡蛋品质保障的关键环节。',
						'1.从卫生健康角度，蛋壳表面的脏污可能携带大量细菌、寄生虫卵等有害物质，检测并去除脏污鸡蛋可减少消费者接触病原体的风险，保障公众身体健康。',
						'2.对于产品外观和市场接受度，洁净的鸡蛋更受消费者青睐，检测脏污鸡蛋能保证上市鸡蛋外观整洁，提升产品市场竞争力，促进销售。'
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
