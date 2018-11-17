exports.PixivDesktopApi = require('./desktopapi')
exports.PixivMobileApi = require('./mobileapi')

const got = require('got')
const fs = require('fs')
const path = require('path')

exports.download = (url, absfilepath = '') => {
	const s = got.stream(url, {
		headers: {
			Referer: 'https://www.pixiv.net/'
		}
	})
	if (path.isAbsolute(absfilepath)) {
		return new Promise((res, rej) => {
			s.pipe(fs.createWriteStream(absfilepath))
				.on('finish', () => res())
				.on('error', rej)
		})
	} else {
		return s
	}
}
