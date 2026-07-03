<template>
	<view>	
		<home v-if="PageCur=='home'"></home>
		<articlelist v-if="PageCur=='articlelist'"></articlelist>
		<join v-if="PageCur=='join'"></join>
		<news v-if="PageCur=='news'"></news>
		<my v-if="PageCur=='my'"></my>

		<!--底部导航-->
		<view class="cu-bar tabbar bg-white foot">
			<view class="action"
				:class="PageCur=='home'?'text-cyan':''"
				@click="NavChange"
				data-cur="home">
				<view class="cuIcon-cu-image">
					<image :src="PageCur=='home'?'/static/homefill.png':'/static/home.png'"></image>
				</view>
				首页
			</view>
			<view class="action"
				:class="PageCur=='my'?'text-cyan':''"
				@click="NavChange"
				data-cur="my">
				<view class="cuIcon-cu-image">
					<image :src="PageCur=='my'?'/static/messagefill.png':'/static/message.png'"></image>
				</view>
				服务
			</view>
			<view class="action add-action"
				:class="PageCur=='join'?'text-cyan':''"
				@click="NavChange"
				data-cur="join">
				<button class="cu-btn cuIcon-cu-image bg-cyan shadow">
					<image src="/static/add.png"></image>
				</button>
				检测
			</view>			
			<view class="action"
				:class="PageCur=='articlelist'?'text-cyan':''"
				@click="NavChange"
				data-cur="articlelist">
				<view class="cuIcon-cu-image">
					<image :src="PageCur=='articlelist'?'/static/wefill.png':'/static/we.png'"></image>
				</view>
				管理
			</view>
			<view class="action"
				:class="PageCur=='news'?'text-cyan':''"
				@click="NavChange"
				data-cur="news">
				<view class="cuIcon-cu-image">
					<image :src="PageCur=='news'?'/static/myfill.png':'/static/my.png'"></image>
				</view>
				我的
			</view>	
		</view>
	</view>
</template>

<script>
import cuCustom from '@/components/cu-custom.vue'

import home from '@/pages/home/home.vue'
import articlelist from '@/pages/xiaotan/articlelist.vue'
import join from '@/pages/join/join.vue'
import news from '@/pages/news/news.vue'
import my from '@/pages/my/my.vue'

export default {
	components: {
		cuCustom,
		home,
		articlelist,
		join,
		news,
		my
	},
	data() {
		return {
			PageCur: 'home'
		}
	},
	onLoad() {
		const authUser = uni.getStorageSync('authUser')
		if (!authUser || authUser.username !== 'admin') {
			uni.reLaunch({
				url: '/pages/auth/login'
			})
		}
	},
	computed: {
		title() {
			switch (this.PageCur) {
				case 'home': return '鸡蛋污损检测系统'
				case 'articlelist': return '污损样本库'
				case 'join': return '上传与检测'
				case 'news': return '预警与通知'
				case 'my': return '设备与模型管理'
			}
		}
	},
	methods: {
		NavChange(e) {
			this.PageCur = e.currentTarget.dataset.cur
		}
	}
}
</script>

<style>
		body {
			background-color: #f1f1f1;
			font-size: 28upx;
			color: #333333;
			font-family: Helvetica Neue, Helvetica, sans-serif;
		}
	
		view,
		scroll-view,
		swiper,
		button,
		input,
		textarea,
		label,
		navigator,
		image {
			box-sizing: border-box;
		}
	
		.round {
			border-radius: 5000upx;
		}
	
		.radius {
			border-radius: 6upx;
		}
	
		.bg-red {
			background-color: #e54d42;
			color: #ffffff;
		}
	
		.bg-orange {
			background-color: #f37b1d;
			color: #ffffff;
		}
	
		.bg-yellow {
			background-color: #fbbd08;
			color: #333333;
		}
	
		.bg-olive {
			background-color: #8dc63f;
			color: #ffffff;
		}
	
		.bg-green {
			background-color: #39b54a;
			color: #ffffff;
		}
	
		.bg-cyan {
			background-color: #1cbbb4;
			color: #ffffff;
		}
	
		.bg-blue {
			background-color: #0081ff;
			color: #ffffff;
		}
	
	
		.bg-grey {
			background-color: #8799a3;
			color: #ffffff;
		}
	
		.bg-gray {
			background-color: #f0f0f0;
			color: #333333;
		}
	
		.bg-black {
			background-color: #333333;
			color: #ffffff;
		}
	
		.bg-white {
			background-color: #ffffff;
			color: #666666;
		}
	
		.text-cyan,
		.line-cyan,
		.lines-cyan {
			color: #1cbbb4;
		}	
		.cu-bar {
			display: flex;
			position: relative;
			align-items: center;
			min-height: 100upx;
			justify-content: space-between;
		}
	
		.cu-bar .action {
			display: flex;
			align-items: center;
			height: 100%;
			justify-content: center;
			max-width: 100%;
		}
	
		.cu-bar .action.border-title {
			position: relative;
			top: -10upx;
		}
	
		.cu-bar .action.border-title text[class*="bg-"]:last-child {
			position: absolute;
			bottom: -0.5rem;
			min-width: 2rem;
			height: 6upx;
			left: 0;
		}
	
		.cu-bar .action.sub-title {
			position: relative;
			top: -0.2rem;
		}
	
		.cu-bar .action.sub-title text {
			position: relative;
			z-index: 1;
		}
	
		.cu-bar .action.sub-title text[class*="bg-"]:last-child {
			position: absolute;
			display: inline-block;
			bottom: -0.2rem;
			border-radius: 6upx;
			width: 100%;
			height: 0.6rem;
			left: 0.6rem;
			opacity: 0.3;
			z-index: 0;
		}
	
		.cu-bar .action.sub-title text[class*="text-"]:last-child {
			position: absolute;
			display: inline-block;
			bottom: -0.7rem;
			left: 0.5rem;
			opacity: 0.2;
			z-index: 0;
			text-align: right;
			font-weight: 900;
			font-size: 36upx;
		}
	
		.cu-bar.justify-center .action.border-title text:last-child,
		.cu-bar.justify-center .action.sub-title text:last-child {
			left: 0;
			right: 0;
			margin: auto;
			text-align: center;
		}
	
		.cu-bar .action:first-child {
			margin-left: 30upx;
			font-size: 30upx;
		}
	
		.cu-bar .action text.text-cut {
			text-align: left;
			width: 100%;
		}
	
		.cu-bar .cu-avatar:first-child {
			margin-left: 20upx;
		}
	
		.cu-bar .action:first-child>text[class*="cuIcon-"] {
			margin-left: -0.3em;
			margin-right: 0.3em;
		}
	
		.cu-bar .action:last-child {
			margin-right: 30upx;
		}
	
		.cu-bar .action>text[class*="cuIcon-"],
		.cu-bar .action>view[class*="cuIcon-"] {
			font-size: 36upx;
		}
	
		.cu-bar .action>text[class*="cuIcon-"]+text[class*="cuIcon-"] {
			margin-left: 0.5em;
		}
	
		.cu-bar .content {
			position: absolute;
			text-align: center;
			width: calc(100% - 340upx);
			left: 0;
			right: 0;
			bottom: 0;
			top: 0;
			margin: auto;
			height: 60upx;
			font-size: 32upx;
			line-height: 60upx;
			cursor: none;
			pointer-events: none;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
	
		.cu-bar.ios .content {
			bottom: 7px;
			height: 30px;
			font-size: 32upx;
			line-height: 30px;
		}
	
		.cu-bar.btn-group {
			justify-content: space-around;
		}
	
		.cu-bar.btn-group button {
			padding: 20upx 32upx;
		}
	
		.cu-bar.btn-group button {
			flex: 1;
			margin: 0 20upx;
			max-width: 50%;
		}
	
		.cu-bar .search-form {
			background-color: #f5f5f5;
			line-height: 64upx;
			height: 64upx;
			font-size: 24upx;
			color: #333333;
			flex: 1;
			display: flex;
			align-items: center;
			margin: 0 30upx;
		}
	
		.cu-bar .search-form+.action {
			margin-right: 30upx;
		}
	
		.cu-bar .search-form input {
			flex: 1;
			padding-right: 30upx;
			height: 64upx;
			line-height: 64upx;
			font-size: 26upx;
			background-color: transparent;
		}
	
		.cu-bar .search-form [class*="cuIcon-"] {
			margin: 0 0.5em 0 0.8em;
		}
	
		.cu-bar .search-form [class*="cuIcon-"]::before {
			top: 0upx;
		}
	
		.cu-bar.fixed,
		.nav.fixed {
			position: fixed;
			width: 100%;
			top: 0;
			z-index: 1024;
			box-shadow: 0 1upx 6upx rgba(0, 0, 0, 0.1);
		}
	
		.cu-bar.foot {
			position: fixed;
			width: 100%;
			bottom: 0;
			z-index: 1024;
			box-shadow: 0 -1upx 6upx rgba(0, 0, 0, 0.1);
		}
	
		.cu-bar.tabbar {
			padding: 0;
			height: calc(100upx + env(safe-area-inset-bottom) / 2);
			padding-bottom: calc(env(safe-area-inset-bottom) / 2);
		}
	
		.cu-tabbar-height {
			min-height: 100upx;
			height: calc(100upx + env(safe-area-inset-bottom) / 2);
		}
	
		.cu-bar.tabbar.shadow {
			box-shadow: 0 -1upx 6upx rgba(0, 0, 0, 0.1);
		}
	
		.cu-bar.tabbar .action {
			font-size: 22upx;
			position: relative;
			flex: 1;
			text-align: center;
			padding: 0;
			display: block;
			height: auto;
			line-height: 1;
			margin: 0;
			background-color: inherit;
			overflow: initial;
		}
	
		.cu-bar.tabbar.shop .action {
			width: 140upx;
			flex: initial;
		}
	
		.cu-bar.tabbar .action.add-action {
			position: relative;
			z-index: 2;
			padding-top: 50upx;
		}
	
		.cu-bar.tabbar .action.add-action [class*="cuIcon-"] {
			position: absolute;
			width: 70upx;
			z-index: 2;
			height: 70upx;
			border-radius: 50%;
			line-height: 70upx;
			font-size: 50upx;
			top: -35upx;
			left: 0;
			right: 0;
			margin: auto;
			padding: 0;
		}
	
		.cu-bar.tabbar .action.add-action::after {
			content: "";
			position: absolute;
			width: 100upx;
			height: 100upx;
			top: -50upx;
			left: 0;
			right: 0;
			margin: auto;
			box-shadow: 0 -3upx 8upx rgba(0, 0, 0, 0.08);
			border-radius: 50upx;
			background-color: inherit;
			z-index: 0;
		}
	
		.cu-bar.tabbar .action.add-action::before {
			content: "";
			position: absolute;
			width: 100upx;
			height: 30upx;
			bottom: 30upx;
			left: 0;
			right: 0;
			margin: auto;
			background-color: inherit;
			z-index: 1;
		}
	
		.cu-bar.tabbar .btn-group {
			flex: 1;
			display: flex;
			justify-content: space-around;
			align-items: center;
			padding: 0 10upx;
		}
	
		.cu-bar.tabbar button.action::after {
			border: 0;
		}
	
		.cu-bar.tabbar .action [class*="cuIcon-"] {
			width: 100upx;
			position: relative;
			display: block;
			height: auto;
			margin: 0 auto 10upx;
			text-align: center;
			font-size: 40upx;
		}
	
		.cu-bar.tabbar .action .cuIcon-cu-image {
			margin: 0 auto;
		}
	
		.cu-bar.tabbar .action .cuIcon-cu-image image {
			width: 36upx;
			height: 36upx;
			display: inline-block;
		}
	
		.cu-bar.tabbar .submit {
			align-items: center;
			display: flex;
			justify-content: center;
			text-align: center;
			position: relative;
			flex: 2;
			align-self: stretch;
		}
	
		.cu-bar.tabbar .submit:last-child {
			flex: 2.6;
		}
	
		.cu-bar.tabbar .submit+.submit {
			flex: 2;
		}
	
		.cu-bar.tabbar.border .action::before {
			content: " ";
			width: 200%;
			height: 200%;
			position: absolute;
			top: 0;
			left: 0;
			transform: scale(0.5);
			transform-origin: 0 0;
			border-right: 1upx solid rgba(0, 0, 0, 0.1);
			z-index: 3;
		}
	
		.cu-bar.tabbar.border .action:last-child:before {
			display: none;
		}
	
		.cu-bar.input {
			padding-right: 20upx;
			background-color: #ffffff;
		}
	
		.cu-bar.input input {
			overflow: initial;
			line-height: 64upx;
			height: 64upx;
			min-height: 64upx;
			flex: 1;
			font-size: 30upx;
			margin: 0 20upx;
		}
	
		.cu-bar.input .action {
			margin-left: 20upx;
		}
	
		.cu-bar.input .action [class*="cuIcon-"] {
			font-size: 48upx;
		}
	
		.cu-bar.input input+.action {
			margin-right: 20upx;
			margin-left: 0upx;
		}
	
		.cu-bar.input .action:first-child [class*="cuIcon-"] {
			margin-left: 0upx;
		}
</style>


