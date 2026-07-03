<script>
	export default {
		onLaunch: function() {
			uni.getSystemInfo({
				success: function(e) {

					const app = getApp()

					// #ifndef MP
					app.globalData.StatusBar = e.statusBarHeight;
					if (e.platform == 'android') {
						app.globalData.CustomBar = e.statusBarHeight + 50;
					} else {
						app.globalData.CustomBar = e.statusBarHeight + 45;
					}
					// #endif

					// #ifdef MP-WEIXIN
					app.globalData.StatusBar = e.statusBarHeight;
					let custom = wx.getMenuButtonBoundingClientRect();
					app.globalData.Custom = custom;
					app.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
					// #endif       

					// #ifdef MP-ALIPAY
					app.globalData.StatusBar = e.statusBarHeight;
					app.globalData.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif

				}
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 每个页面公共css */
</style>