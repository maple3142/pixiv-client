const got = require('got')
const FormData = require('form-data')
const constants = require('./constants')

// Mobile Pixiv api reference: https://github.com/DIYgod/RSSHub/blob/master/routes/pixiv

const obj2fd = obj => {
	const fd = new FormData()
	for (const [k, v] of Object.entries(obj)) {
		fd.append(k, v)
	}
	return fd
}

class PixivMobileApi {
	constructor({ username, password, oauthinfo }) {
		this.currentUser = oauthinfo.user
		this.oauthinfo = oauthinfo
		this.mclient = got.extend({
			headers: {
				Authorization: `Bearer ${oauthinfo.access_token}`,
				...constants.maskHeaders
			},
			baseUrl: 'https://app-api.pixiv.net/v1'
		})
		this.oauthtime = Date.now()
		this.username = username
		this.password = password
	}
	async checkAndRefreshToken() {
		const tokenHasExpired = Date.now() - this.oauthtime > this.oauthinfo.expires_in * 0.9
		if (tokenHasExpired) {
			this.oauthinfo = await PixivMobile.auth({
				username: this.username,
				password: this.password,
				refresh_token: this.oauthinfo.refresh_token
			})
		}
	}
	responseHandler(resp) {
		return resp.body
	}
	async getJson(url, opts) {
		await this.checkAndRefreshToken()
		return this.mclient.get(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	async postJson(url, opts) {
		await this.checkAndRefreshToken()
		return this.mclient.post(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	getRanking(mode, date) {
		const query = {
			mode,
			filter: 'for_ios'
		}
		if (date) {
			query.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
		}
		return this.getJson('/illust/ranking', { query })
	}
	getBookmarks(userId) {
		return this.getJson('/user/bookmarks/illust', { query: { user_id: userId, restrict: 'public' } })
	}
	getUserDetail(userId) {
		return this.getJson('/user/detail', { query: { user_id: userId } })
	}
	getIllusts(userId) {
		return this.getJson('/user/illusts', { query: { user_id: userId, filter: 'for_ios', type: 'illust' } })
	}
	static async auth({ username, password, refresh_token }) {
		try {
			const obj = {
				client_id: constants.client_id,
				client_secret: constants.client_secret,
				get_secure_url: 1
			}
			if (refresh_token) {
				obj.grant_type = 'refresh_token'
				obj.refresh_token = refresh_token
			} else {
				obj.grant_type = 'password'
				obj.username = username
				obj.password = password
			}
			const resp = await got
				.post('https://oauth.secure.pixiv.net/auth/token', {
					body: obj2fd(obj),
					headers: constants.maskHeaders
				})
				.then(r => JSON.parse(r.body))
			return resp.response
		} catch (e) {
			throw new Error('Login failed!')
		}
	}
	static async login(opts) {
		const oauthinfo = await PixivMobileApi.auth(opts)
		return new PixivMobileApi(Object.assign({}, opts, { oauthinfo }))
	}
}

module.exports = PixivMobileApi
