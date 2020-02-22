import * as crypto from 'crypto'
import * as got from 'got'
import * as FormData from 'form-data'
import constants from '../constants'
import {
	ApiResponse,
	ExtendedSearchOption,
	Params,
	RankingMode,
	IllustListResponse,
	UsernameAuth,
	RefreshAuth,
	Oauth,
	Nextable
} from './types'
import LoginError from '../LoginError'

// Mobile Pixiv api reference: https://github.com/upbit/pixivpy/wiki

const obj2fd = (obj: object) => {
	const fd = new FormData()
	for (const [k, v] of Object.entries(obj)) {
		fd.append(k, v)
	}
	return fd
}

const filter = 'for_ios' // filter parameter

type Id = string | number

export class PixivMobileApi {
	public oauth: Oauth
	private client: any
	constructor({
		oauthinfo
	}: {
		username: string
		password: string
		oauthinfo: any
	}) {
		this.oauth = {
			info: oauthinfo,
			time: Date.now()
		}
		this.updateClientWithToken(this.oauth.info.access_token)
	}
	// #region internal
	private updateClientWithToken(accessToken: string) {
		this.client = got.extend({
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...constants.maskHeaders
			},
			baseUrl: 'https://app-api.pixiv.net/'
		})
	}
	async checkAndRefreshToken() {
		const tokenHasExpired =
			Date.now() - this.oauth.time >
			this.oauth.info.expires_in * 1000 * 0.9
		if (tokenHasExpired) {
			this.oauth.info = await PixivMobileApi.auth({
				refresh_token: this.oauth.info.refresh_token
			})
			this.updateClientWithToken(this.oauth.info.access_token)
		}
	}
	responseHandler(resp: { body: any }) {
		return resp.body
	}
	async getJson(url: string, query?: object) {
		await this.checkAndRefreshToken()
		return this.client
			.get(url, { json: true, query })
			.then(this.responseHandler)
	}
	async postJson(url: string, params?: object) {
		await this.checkAndRefreshToken()
		return this.client
			.post(url, { json: true, form: true, body: params })
			.then(this.responseHandler)
	}
	// #endregion internal
	// #region publicApis
	makeIterable<T extends Nextable>(resp: T): AsyncIterable<T> {
		const self = this
		return {
			[Symbol.asyncIterator]: async function*() {
				yield resp
				while (resp.next_url) {
					resp = await self.getJson(resp.next_url)
					yield resp
				}
			}
		}
	}
	searchIllusts(
		keyword: string,
		{
			searchTarget = 'partial_match_for_tags',
			sort = 'date_desc',
			duration,
			offset
		}: ExtendedSearchOption
	): Promise<IllustListResponse> {
		const query: Params = {
			word: keyword,
			search_target: searchTarget,
			sort,
			filter,
			offset
		}
		if (duration) {
			query.duration = duration
		}
		return this.getJson('/v1/search/illust', query)
	}
	searchPopularIllusts(
		keyword: string,
		{ searchTarget = 'partial_match_for_tags' } = {}
	): Promise<IllustListResponse> {
		const query = {
			word: keyword,
			search_target: searchTarget,
			filter
		}
		return this.getJson('/v1/search/popular-preview/illust', query)
	}
	searchUsers(keyword: string): Promise<ApiResponse> {
		return this.getJson('/v1/search/user', { word: keyword, filter })
	}
	getRanking(mode: RankingMode, date?: Date): Promise<IllustListResponse> {
		const query: Params = {
			mode,
			filter
		}
		if (date) {
			query.date = `${date.getFullYear()}-${date.getMonth() +
				1}-${date.getDate()}`
		}
		return this.getJson('/v1/illust/ranking', query)
	}
	getTrendingTags(): Promise<ApiResponse> {
		return this.getJson('/v1/trending-tags/illust', { filter })
	}
	getBookmarkTags(publicMode = true): Promise<ApiResponse> {
		return this.getJson('/v1/user/bookmark-tags/illust', {
			restrict: publicMode ? 'public' : 'private'
		})
	}
	getUserBookmarks(userId: Id): Promise<IllustListResponse> {
		return this.getJson('/v1/user/bookmarks/illust', {
			user_id: userId,
			restrict: 'public'
		})
	}
	getUserDetail(userId: Id): Promise<ApiResponse> {
		return this.getJson('/v1/user/detail', { user_id: userId })
	}
	getUserMypixiv(userId: Id): Promise<ApiResponse> {
		return this.getJson('/v1/user/mypixiv', { user_id: userId })
	}
	getUserFollowers(userId: Id): Promise<ApiResponse> {
		return this.getJson('/v1/user/follower', { user_id: userId })
	}
	getUserFollowings(userId: Id): Promise<ApiResponse> {
		return this.getJson('/v1/user/following', { user_id: userId })
	}
	getIllusts(userId: Id): Promise<ApiResponse> {
		return this.getJson('/v1/user/illusts', {
			user_id: userId,
			filter,
			type: 'illust'
		})
	}
	getNewIllusts(): Promise<ApiResponse> {
		return this.getJson('/v1/illust/new')
	}
	getRecommendedIllusts({ includeRanking = true } = {}): Promise<
		ApiResponse
	> {
		return this.getJson('/v1/illust/recommended', {
			content_type: 'illust',
			include_ranking_label: includeRanking,
			filter
		})
	}
	getFollowingIllusts(): Promise<ApiResponse> {
		return this.getJson('/v2/illust/follow', { restrict: 'public' })
	}
	getIllustDetail(illustId: Id): Promise<ApiResponse> {
		return this.getJson('/v1/illust/detail', {
			illust_id: illustId,
			filter
		})
	}
	getIllustComment(illustId: Id): Promise<ApiResponse> {
		return this.getJson('/v1/illust/comments', {
			illust_id: illustId,
			include_total_comments: true
		})
	}
	getIllustRelated(illustId: Id): Promise<ApiResponse> {
		return this.getJson('/v2/illust/related', {
			illust_id: illustId,
			filter
		})
	}
	addBookmark(
		illustId: Id,
		{ publicMode = true } = {}
	): Promise<ApiResponse> {
		return this.postJson('/v2/illust/bookmark/add', {
			illust_id: illustId,
			restrict: publicMode ? 'public' : 'private'
		})
	}
	deleteBookmark(illustId: Id): Promise<ApiResponse> {
		return this.postJson('/v1/illust/bookmark/delete', {
			illust_id: illustId
		})
	}
	getRecommendedNovels({ includeRanking = true } = {}): Promise<ApiResponse> {
		return this.getJson('/v1/novel/recommended', {
			include_ranking_novels: includeRanking,
			filter
		})
	}
	getRecommendedMangas({ includeRanking = true } = {}): Promise<ApiResponse> {
		return this.getJson('/v1/manga/recommended', {
			include_ranking_label: includeRanking,
			filter
		})
	}
	// #endregion
	private static async auth(opts: UsernameAuth | RefreshAuth) {
		try {
			const now_time = new Date()
			const localTime = `${now_time.getUTCFullYear()}-${now_time.getUTCMonth() +
				1}-${now_time.getUTCDate()}T${now_time
				.getUTCHours()
				.toString()
				.padStart(2, '0')}:${now_time
				.getUTCMinutes()
				.toString()
				.padStart(2, '0')}:${now_time
				.getUTCSeconds()
				.toString()
				.padStart(2, '0')}+00:00`
			const clientHeaders = {
				'X-Client-Time': localTime,
				'X-Client-Hash': crypto
					.createHash('md5')
					.update(`${localTime}${constants.hash_secret}`)
					.digest('hex')
			}
			const obj: Params = {
				client_id: constants.client_id,
				client_secret: constants.client_secret,
				get_secure_url: 1
			}
			if ('refresh_token' in opts) {
				obj.grant_type = 'refresh_token'
				obj.refresh_token = opts.refresh_token
			} else {
				obj.grant_type = 'password'
				obj.username = opts.username
				obj.password = opts.password
			}
			const resp = await got
				.post('https://oauth.secure.pixiv.net/auth/token', {
					body: obj2fd(obj),
					headers: Object.assign(
						{},
						constants.maskHeaders,
						clientHeaders
					)
				})
				.then(r => JSON.parse(r.body))
			return resp.response
		} catch (e) {
			throw new LoginError(e)
		}
	}
	static async login(opts: {
		username: string
		password: string
	}): Promise<PixivMobileApi> {
		const oauthinfo = await PixivMobileApi.auth(opts)
		return new PixivMobileApi(Object.assign({}, opts, { oauthinfo }))
	}
}
