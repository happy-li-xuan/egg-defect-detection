export function formatTime(time) {
	if (typeof time !== 'number' || time < 0) {
		return time
	}

	const hour = parseInt(time / 3600, 10)
	time %= 3600
	const minute = parseInt(time / 60, 10)
	const second = time % 60

	return [hour, minute, second]
		.map((n) => {
			const value = n.toString()
			return value[1] ? value : `0${value}`
		})
		.join(':')
}

export function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude)
		latitude = parseFloat(latitude)
	}

	longitude = longitude.toFixed(2)
	latitude = latitude.toFixed(2)

	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	}
}

export const dateUtils = {
	UNITS: {
		年: 31557600000,
		月: 2629800000,
		天: 86400000,
		小时: 3600000,
		分钟: 60000,
		秒: 1000
	},
	humanize(milliseconds) {
		let text = ''
		Object.keys(this.UNITS).some((key) => {
			if (milliseconds >= this.UNITS[key]) {
				text = `${Math.floor(milliseconds / this.UNITS[key])}${key}前`
				return true
			}
			return false
		})
		return text || '刚刚'
	},
	format(dateStr) {
		const date = this.parse(dateStr)
		const diff = Date.now() - date.getTime()
		if (diff < this.UNITS.天) {
			return this.humanize(diff)
		}
		const fix = (num) => (num < 10 ? `0${num}` : num)
		return `${date.getFullYear()}/${fix(date.getMonth() + 1)}/${fix(date.getDate())}-${fix(date.getHours())}:${fix(date.getMinutes())}`
	},
	parse(str) {
		const arr = str.split(/[^0-9]/)
		return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5])
	}
}

export default {
	formatTime,
	formatLocation,
	dateUtils
}
