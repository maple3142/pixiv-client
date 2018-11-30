import * as got from 'got'
import * as cheerio from 'cheerio'
import { CookieJar } from 'tough-cookie'
import { Illust } from './illust'

// Desktop Pixiv api docs: https://github.com/FlandreDaisuki/Patchouli/wiki/New-API-List

type Id = string | number

export class PixivDesktopApi {
	private cookieJar: CookieJar
	private client: any
	private _csrf: string
	// static login(opts: LoginOption): Promise<PixivDesktopApi>
	constructor({ cookieJar }: { cookieJar: CookieJar }) {
		this.cookieJar = cookieJar
		this.client = (<any>got).extend({ cookieJar, baseUrl: 'https://www.pixiv.net/' })
	}
	private responseHandler(resp: got.Response<{ body?: any; error?: any }>) {
		if (resp.body.error) {
			throw resp
		}
		return resp.body.body || resp.body
	}
	private getJson(url: string, opts?: any) {
		return this.client.get(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	private postJson(url: string, opts?: any) {
		return this.client.post(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	private async rpcCall(mode: string, params = {}) {
		return this.postJson('/rpc/index.php', {
			method: 'POST',
			form: true,
			body: Object.assign(params, { mode, tt: await this.getCsrf() })
		})
	}
	private async getCsrf() {
		// IMPURE
		if (this._csrf) {
			return this._csrf
		}
		const $ = await this.client.get('/').then((r: got.Response<string>) => cheerio.load(r.body))
		// .text() cannot get script content in cheerio
		const targetScript = $('script')
			.toArray()
			.find((s: any) =>
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
	getIllustData(illustId: Id): Promise<Illust> {
		return this.getJson(`/ajax/illust/${illustId}`)
	}
	getIllustBookmarkData(illustId: Id): Promise<any> {
		return this.getJson(`/ajax/illust/${illustId}/bookmarkData`)
	}
	getUserData(userId: Id): Promise<any> {
		return this.getJson(`/ajax/user/${userId}`)
	}
	getUserProfileData(userId: Id): Promise<any> {
		return this.getJson(`/ajax/user/${userId}/profile/all`)
	}
	getUserBookmarkData(userId: Id, optSearchParams = {}): Promise<any> {
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
	getIllustUgoiraMetaData(illustId: Id): Promise<any> {
		return this.getJson(`/ajax/illust/${illustId}/ugoira_meta`)
	}
	async postIllustLike(illustId: Id): Promise<any> {
		const token = await this.getCsrf()
		return this.postJson('/ajax/illusts/like', {
			headers: {
				'X-CSRF-Token': token
			},
			body: {
				illust_id: illustId
			}
		}).then((r: any) => r.is_liked) // it means whether you like the illust `before` this action
	}
	async postFollowUser(userId: Id): Promise<any> {
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
	postRPCAddBookmark(illustId: Id): Promise<any> {
		return this.rpcCall('save_illust_bookmark', {
			comment: '',
			illust_id: illustId,
			restrict: 0,
			tags: ''
		}).then(() => true)
	}
	postRPCDeleteBookmark(bookmarkId: Id): Promise<any> {
		return this.rpcCall('delete_illust_bookmark', { bookmark_id: bookmarkId }).then(() => true)
	}
	private static async auth({ username, password }: { username: string; password: string }) {
		const cookieJar = new CookieJar()
		const client = (<any>got).extend({
			cookieJar,
			baseUrl: 'https://accounts.pixiv.net/',
			headers: {
				Origin: 'https://accounts.pixiv.net',
				Referer: 'https://accounts.pixiv.net/'
			}
		})
		const $ = await client.get('/login').then((r: got.Response<string>) => cheerio.load(r.body))
		const post_key = $('input[name=post_key]').attr('value')
		const resp = await client.post('/api/login', {
			form: true,
			body: {
				pixiv_id: username,
				password: password,
				post_key
			}
		})
		if ('set-cookie' in resp.headers) {
			return cookieJar
		} else {
			throw new Error('Login failed!')
		}
	}
	static async login(opts: { username: string; password: string }) {
		return new PixivDesktopApi({ cookieJar: await PixivDesktopApi.auth(opts) })
	}
	static async withoutLogin() {
		return new PixivDesktopApi({ cookieJar: new CookieJar() })
	}
}
