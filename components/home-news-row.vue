<template>
	<view class="row" hover-class="row-hover" @click="$emit('select', item)">
		<image class="thumb" mode="aspectFill" :src="item.cover" />
		<view class="body">
			<text class="title">{{ item.title }}</text>
			<view class="meta">
				<text class="source">{{ item.author_name }}</text>
				<text class="time">{{ item.published_at }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'HomeNewsRow',
	props: {
		item: {
			type: Object,
			required: true
		}
	}
}
</script>

<style scoped>
.row {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	padding: 22upx 24upx;
	background: #fff;
	border-bottom: 1px solid #ececec;
}
.row-hover {
	background: #f7f7f7;
}
.thumb {
	width: 180upx;
	height: 140upx;
	border-radius: 8upx;
	flex-shrink: 0;
	margin-right: 20upx;
	background: #e5e7eb;
}
.body {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 0;
}
.title {
	font-size: 30upx;
	font-weight: 600;
	color: #111827;
	line-height: 40upx;
	max-height: 80upx;
	overflow: hidden;
}
.meta {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-top: 12upx;
}
.source {
	font-size: 24upx;
	color: #9ca3af;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-right: 16upx;
}
.time {
	font-size: 24upx;
	color: #9ca3af;
	flex-shrink: 0;
}
</style>
