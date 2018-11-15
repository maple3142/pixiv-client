const got = require('got')
const cheerio = require('cheerio')
const { CookieJar } = require('tough-cookie')

// Desktop Pixiv api docs: https://github.com/FlandreDaisuki/Patchouli/wiki/New-API-List

class DesktopApi {
	constructor({ cookieJar}) {
		this.cookieJar = cookieJar
		this.client = got.extend({ cookieJar, baseUrl: 'https://www.pixiv.net/' })
	}
	responseHandler(resp) {
		if (resp.body.error) {
			throw resp
		}
		return resp.body.body || resp.body
	}
	getJson(url, opts) {
		return this.client.get(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	postJson(url, opts) {
		return this.client.post(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
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
	static async login(acc, pwd) {
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
}

module.exports = DesktopApi
