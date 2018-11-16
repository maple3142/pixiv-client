# pixiv-client

> Pixiv api client written in node.js

## Example

```js
// ES6:
import { PixivDesktopApi, PixivMobileApi } from 'pixiv-client'
// Commomjs:
const { PixivDesktopApi, PixivMobileApi } = require('pixiv-client')

;(async () => {
  const auth = {
    username: 'USERNAME',
    password: 'PASSWORD'
  }
  const dc = await PixivDesktopApi.login(auth)
  console.log(await dc.postIllustLike(70337017))
  console.log(await dc.getUserProfileData(5323203))
  const mc = await PixivMobileApi.login(auth)
  console.log(await mc.getRanking('day'))
  const bm = await mc.getUserBookmarks(mc.currentUser.id)
  if (mc.hasNext(bm)) {
    console.log(await mc.next(bm))
  }
  else{
    console.log(bm)
  }
})()
```

## Documentation

[index.ts](./src/index.ts)

> Although there is lots of undocumented api if you inspect the api client, you should not use it because it won't follow semver.
