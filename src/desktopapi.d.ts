type Id = string | number
interface LoginOption {
	username: string
	password: string
}
export declare class PixivDesktopApi {
	getIllustData(illustId: Id): Promise<any>
	getIllustBookmarkData(illustId: Id): Promise<any>
	getUserData(userId: Id): Promise<any>
	getUserProfileData(userId: Id): Promise<any>
	getUserBookmarkData(userId: Id, optSearchParams?: object): Promise<any>
	getIllustUgoiraMetaData(illustId: Id): Promise<any>
	postIllustLike(illustId: Id): Promise<any>
	postFollowUser(userId: Id): Promise<any>
	postRPCAddBookmark(illustId: Id): Promise<any>
	postRPCDeleteBookmark(bookmarkId: Id): Promise<any>
	static login(opts: LoginOption): Promise<PixivDesktopApi>
}
