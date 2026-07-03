<template>
	<view class="page">
		<view class="profile">
			<view class="avatar">{{user.avatar}}</view>
			<view class="base">
				<view class="name">{{user.name}}</view>
				<view class="job">{{user.job}}</view>
			</view>
		</view>

		<view class="box" v-for="item in infoList" :key="item.title">
			<view class="box-title">{{item.title}}</view>

			<view v-if="item.type=='text'" class="text">
				{{item.content}}
			</view>

			<view v-if="item.type=='tag'" class="tag-box">
				<view class="tag" v-for="tag in item.content" :key="tag">
					{{tag}}
				</view>
			</view>

			<view v-if="item.type=='list'" class="list">
				<view class="list-item" v-for="data in item.content" :key="data.name">
					<view class="item-title">{{data.name}}</view>
					<view class="item-desc">{{data.desc}}</view>
				</view>
			</view>

			<view v-if="item.type=='row'" class="row" v-for="row in item.content" :key="row.key">
				<text>{{row.key}}</text>
				<text>{{row.value}}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data(){
		return {
			user:{
				avatar:'算法',
				name:'王奇淼',
				job:'软件工程师'
			},
			infoList:[
				{
					title:'个人简介',
					type:'text',
					content:'主要研究人工智能、计算机视觉和智能检测技术，关注AI算法在鸡蛋缺损检测场景中的应用。'
				},
				{
					title:'技术能力',
					type:'tag',
					content:['Vue3','Spring Boot','Python','YOLO','深度学习','图像处理']
				},
				{
					title:'项目经历',
					type:'list',
					content:[
						{
							name:'智能视觉检测系统',
							desc:'利用深度学习模型实现目标识别和缺陷检测。'
						},
						{
							name:'数据管理平台',
							desc:'负责前后端开发，实现业务数据可视化。'
						}
					]
				},
				{
					title:'基础信息',
					type:'row',
					content:[
						{
							key:'专业',
							value:'农业工程与信息技术'
						},
						{
							key:'方向',
							value:'农业应用'
						},
						{
							key:'邮箱',
							value:'example@email.com'
						}
					]
				}
			]
		}
	}
}
</script>

<style>
.page{
	padding:20upx;
	background:#f5f7fb;
	min-height:100vh;
}
.profile{
	display:flex;
	align-items:center;
	padding:30upx;
	background:#2563eb;
	border-radius:20upx;
	color:#fff;
}
.avatar{
	width:100upx;
	height:100upx;
	border-radius:50%;
	background:rgba(255,255,255,.25);
	display:flex;
	align-items:center;
	justify-content:center;
	font-size:36upx;
}
.base{
	margin-left:20upx;
}
.name{
	font-size:34upx;
	font-weight:bold;
}
.job{
	margin-top:8upx;
	font-size:24upx;
}
.box{
	background:#fff;
	margin-top:18upx;
	padding:22upx;
	border-radius:18upx;
}
.box-title{
	font-size:30upx;
	font-weight:bold;
	margin-bottom:15upx;
}
.text{
	font-size:25upx;
	color:#555;
	line-height:1.6;
}
.tag-box{
	display:flex;
	flex-wrap:wrap;
	gap:12upx;
}
.tag{
	padding:8upx 16upx;
	background:#eff6ff;
	color:#2563eb;
	border-radius:20upx;
	font-size:23upx;
}
.list-item{
	padding:15upx 0;
	border-bottom:1px solid #eee;
}
.item-title{
	font-size:27upx;
	font-weight:600;
}
.item-desc{
	margin-top:6upx;
	font-size:24upx;
	color:#666;
}
.row{
	display:flex;
	justify-content:space-between;
	padding:12upx 0;
	font-size:25upx;
	color:#555;
}
</style>