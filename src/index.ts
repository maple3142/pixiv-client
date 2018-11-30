export { PixivDesktopApi } from './desktop'
export { PixivMobileApi } from './mobile'
import * as got from 'got'
import * as fs from 'fs'
import * as path from 'path'
import { Duplex } from 'stream'

export function downloadAsStream(url: string): Duplex {
	return got.stream(url, {
		headers: {
			Referer: 'https://www.pixiv.net/'
		}
	})
}
export function downloadToLocal(url: string, absfilepath = '') {
	if (!path.isAbsolute(absfilepath)) {
		throw new TypeError('path must be absolute path!')
	}
	return new Promise((res, rej) => {
		downloadAsStream(url)
			.pipe(fs.createWriteStream(absfilepath))
			.on('finish', () => res())
			.on('error', rej)
	})
}
