# pixiv-client

> Pixiv api client for node.js written in typescript.

## Example

```js
// ES6:
import { PixivDesktopApi, PixivMobileApi, downloadAsStream } from 'pixiv-client'
// Commomjs:
const { PixivDesktopApi, PixivMobileApi, downloadAsStream } = require('pixiv-client')

;(async () => {
  // Desktop api examples
  const dc = await PixivDesktopApi.create() // no after-login function in PixivDesktopApi
  const r = await dc.getIllustData(70337017)
  downloadAsStream(r.urls.original).pipe(fs.createWriteStream(__dirname + '/test.png')) // or `await downloadToLocal(r.urls.original, __dirname + '/test.png')`
  console.log(await dc.getUserProfileData(5323203))

  // Mobile api examples
  const mc = await PixivMobileApi.login({
    username: 'USERNAME',
    password: 'PASSWORD'
  })
  console.log(await mc.getRanking('day'))
  console.log((await mc.getUserBookmarks(mc.oauth.info.user.id)).illusts)

  // Working with async iterator
  const ar = []
  const result = await c.searchIllusts('ノゾミ(プリコネ)', {
    searchTarget: 'exact_match_for_tags'
  })
  for await (const r of c.makeIterable(result)){
    ar.push(...r.illusts)
  }
  console.log(ar.length)
})()
```

## Documentation

* [index](src/index.ts)
* [desktop api](src/desktop/index.ts)
* [mobile api](src/mobile/index.ts)
