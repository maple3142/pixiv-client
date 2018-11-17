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

const filter = 'for_ios' // filter parameter

class PixivMobileApi {
	constructor({ username, password, oauthinfo }) {
		this.currentUser = oauthinfo.user
		this.oauthinfo = oauthinfo
		this.client = got.extend({
			headers: {
				Authorization: `Bearer ${oauthinfo.access_token}`,
				...constants.maskHeaders
			},
			baseUrl: 'https://app-api.pixiv.net/'
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
	async getJson(url, query) {
		await this.checkAndRefreshToken()
		return this.client.get(url, { json: true, query }).then(this.responseHandler)
	}
	async postJson(url, params) {
		await this.checkAndRefreshToken()
		return this.client.post(url, { json: true, form: true, body: params }).then(this.responseHandler)
	}
	hasNext(resp) {
		return !!resp.next_url
	}
	next(resp) {
		return this.getJson(resp.next_url)
	}
	searchIllust(keyword, { searchTarget = 'partial_match_for_tags', sort = 'date_desc', duration } = {}) {
		const query = {
			word: keyword,
			search_target: searchTarget,
			sort,
			filter
		}
		if (duration) {
			query.duration = duration
		}
		return this.getJson('/v1/search/illust', query)
	}
	searchUser(keyword) {
		return this.getJson('/v1/search/user', { word: keyword, filter })
	}
	getRanking(mode, date) {
		const query = {
			mode,
			filter
		}
		if (date) {
			query.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
		}
		return this.getJson('/v1/illust/ranking', query)
	}
	getTrendingTags() {
		return this.getJson('/v1/trending-tags/illust', { filter })
	}
	getBookmarkTags(publicMode = true) {
		return this.getJson('/v1/user/bookmark-tags/illust', { restrict: publicMode ? 'public' : 'private' })
	}
	getUserBookmarks(userId) {
		return this.getJson('/v1/user/bookmarks/illust', { user_id: userId, restrict: 'public' })
	}
	getUserDetail(userId) {
		return this.getJson('/v1/user/detail', { user_id: userId })
	}
	getUserMypixiv(userId) {
		return this.getJson('/v1/user/mypixiv', { user_id: userId })
	}
	getUserFollowers(userId) {
		return this.getJson('/v1/user/follower', { user_id: userId })
	}
	getUserFollowings(userId) {
		return this.getJson('/v1/user/following', { user_id: userId })
	}
	getIllusts(userId) {
		return this.getJson('/v1/user/illusts', { user_id: userId, filter, type: 'illust' })
	}
	getNewIllusts() {
		return this.getJson('/v1/illust/new')
	}
	getRecommendedIllusts({ includeRanking = true } = {}) {
		return this.getJson('/v1/illust/recommended', {
			content_type: 'illust',
			include_ranking_label: includeRanking,
			filter
		})
	}
	getFollowingIllusts() {
		return this.getJson('/v2/illust/follow', { restrict: 'public' })
	}
	getIllustDetail(illustId) {
		return this.getJson('/v1/illust/detail', { illust_id: illustId, filter })
	}
	getIllustComment(illustId) {
		return this.getJson('/v1/illust/comments', { illust_id: illustId, include_total_comments: true })
	}
	getIllustRelated(illustId) {
		return this.getJson('/v2/illust/related', { illust_id: illustId, filter })
	}
	addBookmark(illustId, { publicMode = true } = {}) {
		return this.postJson('/v2/illust/bookmark/add', {
			illust_id: illustId,
			restrict: publicMode ? 'public' : 'private'
		})
	}
	deleteBookmark(illustId) {
		return this.postJson('/v1/illust/bookmark/delete', {
			illust_id: illustId
		})
	}
	getRecommendedNovels({ includeRanking = true } = {}) {
		return this.getJson('/v1/novel/recommended', {
			include_ranking_novels: includeRanking,
			filter
		})
	}
	getRecommendedMangas({ includeRanking = true } = {}) {
		return this.getJson('/v1/manga/recommended', {
			include_ranking_label: includeRanking,
			filter
		})
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
