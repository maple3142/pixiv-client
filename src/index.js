const DesktopApi = require('./desktopapi')
const MobileApi = require('./mobileapi')
const { inherits } = require('util')

class Pixiv {
	constructor(options) {
		const dc = new DesktopApi(options)
		const mc = new MobileApi(options)
		Object.assign(this, dc)
		Object.assign(this, mc)
	}
	static async login(acc, pwd) {
		const cookieJar = await DesktopApi.login(acc, pwd)
		const oauthinfo = await MobileApi.auth(acc, pwd)
		return new Pixiv({ cookieJar, oauthinfo, acc, pwd })
	}
}

inherits(Pixiv, DesktopApi)
inherits(Pixiv, MobileApi)

module.exports = Pixiv
