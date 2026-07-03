<template>
	<view class="page">
		<view class="card">
<!-- 登录页面 -->
			<view class="title">🥚 鸡蛋缺陷检测系统</view>
			<view class="subtitle">请登录后进入系统</view>

			<input v-model="form.username" class="input" placeholder="请输入账号" />
			<input v-model="form.password" class="input" placeholder="请输入密码" password />

			<button class="primary" @click="submit('login')">登录</button>
			<button class="ghost" @click="submit('register')">注册</button>

			<view class="tip">请先联系管理员注册成功后再登录！</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			form: {
				username: 'admin',
				password: 'admin'
			}
		}
	},
	methods: {
		submit(action) {
			const { username, password } = this.form
			if (username !== 'admin' || password !== 'admin') {
				uni.showToast({
					title: action === 'register' ? '注册失败：请联系管理员进行注册' : '账号或密码错误',
					icon: 'none'
				})
				return
			}
			uni.setStorageSync('authUser', {
				username: 'admin',
				loginAt: Date.now()
			})
			uni.showToast({
				title: action === 'register' ? '注册成功，正在进入' : '登录成功，正在进入',
				icon: 'success'
			})
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			}, 600)
		}
	}
}
</script>

<style>
.page {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx;
}

/* 卡片 */
.card {
	width: 100%;
	max-width: 600rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-radius: 24rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.15);
}

/* 标题 */
.title {
	font-size: 38rpx;
	font-weight: 700;
	text-align: center;
	color: #1e293b;
}

/* 副标题 */
.subtitle {
	margin-top: 12rpx;
	font-size: 24rpx;
	text-align: center;
	color: #64748b;
}

/* 输入框 */
.input {
	margin-top: 24rpx;
	height: 90rpx;
	border-radius: 14rpx;
	padding: 0 20rpx;
	font-size: 26rpx;
	background: #f8fafc;
	border: 1px solid transparent;
	transition: all 0.2s;
}

/* 输入框聚焦 */
.input:focus {
	border-color: #6366f1;
	background: #fff;
}

/* 主按钮 */
.primary {
	margin-top: 28rpx;
	height: 90rpx;
	background: linear-gradient(135deg, #4f46e5, #6366f1);
	color: #fff;
	border-radius: 999rpx;
	font-size: 28rpx;
	box-shadow: 0 10rpx 20rpx rgba(79, 70, 229, 0.3);
}

/* 次按钮 */
.ghost {
	margin-top: 18rpx;
	height: 90rpx;
	background: #eef2ff;
	color: #4f46e5;
	border-radius: 999rpx;
	font-size: 28rpx;
}

/* 提示文字 */
.tip {
	margin-top: 20rpx;
	text-align: center;
	color: #94a3b8;
	font-size: 22rpx;
}
</style>