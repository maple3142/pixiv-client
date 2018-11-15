# pixiv-client

## Example

```js
;(async () => {
  const client = await Pixiv.login('YOUR_PIXIV_ACCOUNT', 'YOUR_PIXIV_PASSWORD')
  console.log(await client.postIllustLike(70337017))
  console.log(await client.getUserProfileData(5323203))
  console.log(await client.getRanking('day'))
  console.log(await client.getBookmarks(client.currentUser.id))
})()
```

## Documentation

[index.ts](./src/index.ts)
