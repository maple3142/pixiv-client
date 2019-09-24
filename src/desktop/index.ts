import * as got from 'got'
import { Illust } from './illust'

// Desktop Pixiv api docs: https://github.com/FlandreDaisuki/Patchouli/wiki/New-API-List

type Id = string | number

export class PixivDesktopApi {
	private client: any
	constructor() {
		this.client = got.extend({ baseUrl: 'https://www.pixiv.net/' })
	}
	// #region internal
	private responseHandler(resp: got.Response<{ body?: any; error?: any }>) {
		if (resp.body.error) {
			throw resp
		}
		return resp.body.body || resp.body
	}
	private getJson(url: string, opts?: any) {
		return this.client.get(url, Object.assign({ json: true }, opts)).then(this.responseHandler)
	}
	// #endregion
	// #region publicApis
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
	// #endregion
	static create() {
		return new PixivDesktopApi()
	}
}
