const got = require('got')
const cheerio = require('cheerio')
const { CookieJar } = require('tough-cookie')
const FormData = require('form-data')
const constants = require('./constants')

// Desktop Pixiv api docs: https://github.com/FlandreDaisuki/Patchouli/wiki/New-API-List
// Mobile Pixiv api reference: https://github.com/DIYgod/RSSHub/blob/master/routes/pixiv

const obj2fd = obj => {
	const fd = new FormData()
	for (const [k, v] of Object.entries(obj)) {
		fd.append(k, v)
	}
	return fd
}

class Pixiv {
	constructor({ cookieJar, oauthinfo, acc, pwd }) {
		// cookieJar is for desktop api, oauthinfo is for mobile api
		this.cookieJar = cookieJar
		this.client = got.extend({ cookieJar, baseUrl: 'https://www.pixiv.net/' })
		this.oauthinfo = oauthinfo
		this.mclient = got.extend({
			headers: {
				Authorization: `Bearer ${oauthinfo.access_token}`,
				...constants.maskHeaders
			},
			baseUrl: 'https://app-api.pixiv.net/v1'
		})
		this.oauthTime = Date.now()
		this.acc = acc
		this.pwd = pwd
	}
	async checkToken() {
		const tokenHasExpired = Date.now() - this.oauthTime > this.oauthinfo.expires_in * 0.9
		if (tokenHasExpired) {
			this.oauthinfo = await Pixiv.refreshToken(this.oauthinfo.refresh_token, this.acc, this.pwd)
		}
	}
	responseHandler(resp) {
		if (resp.body.error) {
			throw resp
		}
		return resp.body.body || resp.body
	}
	mresponseHandler(resp) {
		return resp.body
	}
	getJson(url, opts) {
		return this.client.get(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	postJson(url, opts) {
		return this.client.post(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	async mgetJson(url, opts) {
		await this.checkToken()
		return this.mclient.get(url, Object.assign({ json: true }, opts)).then(this.mresponseHandler)
	}
	async mpostJson(url, opts) {
		await this.checkToken()
		return this.mclient.post(url, Object.assign({ json: true }, opts)).then(this.mresponseHandler)
	}
	// desktop api methods
	async rpcCall(mode, params = {}) {
		return this.postJson('/rpc/index.php', {
			method: 'POST',
			form: true,
			body: Object.assign(params, { mode, tt: await this.getCsrf() })
		})
	}
	async getCsrf() {
		// IMPURE
		if (this._csrf) {
			return this._csrf
		}
		const $ = await this.client.get('/').then(r => cheerio.load(r.body))
		// .text() cannot get script content in cheerio
		const targetScript = $('script')
			.toArray()
			.find(s =>
				$(s)
					.html()
					.includes('pixiv.context.token')
			)
		const rgx = /pixiv\.context\.token = "([a-z0-9]+)"/.exec($(targetScript).html())
		const token = rgx ? rgx[1] : null
		this._csrf = token
		setTimeout(() => {
			this._csrf = null
		}, 60 * 1000) // reset after 60 seconds
		return token
	}
	getIllustData(illustId) {
		return this.getJson(`/ajax/illust/${illustId}`)
	}
	getIllustBookmarkData(illustId) {
		return this.getJson(`/ajax/illust/${illustId}/bookmarkData`)
	}
	getUserData(userId) {
		return this.getJson(`/ajax/user/${userId}`)
	}
	getUserProfileData(userId) {
		return this.getJson(`/ajax/user/${userId}/profile/all`)
	}
	getUserBookmarkData(userId, optSearchParams = {}) {
		return this.getJson(`/ajax/user/${userId}/illusts/bookmarks`, {
			query: Object.assign(
				{
					limit: 24,
					offset: 0,
					rest: 'show',
					tag: ''
				},
				optSearchParams
			)
		})
	}
	getIllustUgoiraMetaData(illustId) {
		return this.getJson(`/ajax/illust/${illustId}/ugoira_meta`)
	}
	async postIllustLike(illustId) {
		const token = await this.getCsrf()
		return this.postJson('/ajax/illusts/like', {
			headers: {
				'X-CSRF-Token': token
			},
			body: {
				illust_id: illustId
			}
		}).then(r => r.is_liked) // it means whether you like the illust `before` this action
	}
	async postFollowUser(userId) {
		return this.postJson('/bookmark_add.php', {
			form: true,
			body: {
				format: 'json',
				mode: 'add',
				restrict: 0,
				tt: await this.getCsrf(),
				type: 'user',
				user_id: userId
			}
		}).then(Boolean) // covert truthy/falsy value to boolean
	}
	postRPCAddBookmark(illustId) {
		return this.rpcCall('save_illust_bookmark', {
			comment: '',
			illust_id: illustId,
			restrict: 0,
			tags: ''
		}).then(() => true)
	}
	postRPCDeleteBookmark(bookmarkId) {
		return this.rpcCall('delete_illust_bookmark', { bookmark_id: bookmarkId }).then(() => true)
	}
	// mobile api methods
	getRanking(mode, date) {
		const query = {
			mode,
			filter: 'for_ios'
		}
		if (date) {
			query.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
		}
		return this.mgetJson('/illust/ranking', { query })
	}
	getBookmarks(userId) {
		return this.mgetJson('/user/bookmarks/illust', { query: { user_id: userId, restrict: 'public' } })
	}
	getUserDetail(userId) {
		return this.mgetJson('/user/detail', { query: { user_id: userId } })
	}
	getIllusts(userId) {
		return this.mgetJson('/user/illusts', { query: { user_id: userId, filter: 'for_ios', type: 'illust' } })
	}
	// login factory methods
	static async loginDesktop(acc, pwd) {
		const cookieJar = new CookieJar()
		const client = got.extend({
			cookieJar,
			baseUrl: 'https://accounts.pixiv.net/',
			headers: {
				Origin: 'https://accounts.pixiv.net',
				Referer: 'https://accounts.pixiv.net/'
			}
		})
		const $ = await client.get('/login').then(r => cheerio.load(r.body))
		const post_key = $('input[name=post_key]').attr('value')
		const resp = await client.post('/api/login', {
			form: true,
			body: {
				pixiv_id: acc,
				password: pwd,
				post_key
			}
		})
		if ('set-cookie' in resp.headers) {
			return cookieJar
		} else {
			throw new Error('Login failed!')
		}
	}
	static async authToken(acc, pwd) {
		try {
			const resp = await got
				.post('https://oauth.secure.pixiv.net/auth/token', {
					body: obj2fd({
						client_id: constants.client_id,
						client_secret: constants.client_secret,
						username: acc,
						password: pwd,
						get_secure_url: 1,
						grant_type: 'password'
					}),
					headers: constants.maskHeaders
				})
				.then(r => JSON.parse(r.body))
			return resp.response
		} catch (e) {
			throw new Error('Login failed!')
		}
	}
	static async refreshToken(acc, pwd, refresh_token) {
		try {
			const resp = await got
				.post('https://oauth.secure.pixiv.net/auth/token', {
					body: obj2fd({
						client_id: constants.client_id,
						client_secret: constants.client_secret,
						username: acc,
						password: pwd,
						get_secure_url: 1,
						grant_type: 'refresh_token',
						refresh_token
					}),
					headers: constants.maskHeaders
				})
				.then(r => JSON.parse(r.body))
			return resp.response
		} catch (e) {
			console.error(e)
			throw new Error('Failed to refresh token!')
		}
	}
	static async login(acc, pwd) {
		const cookieJar = await Pixiv.loginDesktop(acc, pwd)
		const oauthinfo = await Pixiv.authToken(acc, pwd)
		return new Pixiv({ cookieJar, oauthinfo, acc, pwd })
	}
}

module.exports = Pixiv
