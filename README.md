# pixiv-client

## Example

```js
;(async () => {
  const p = await Pixiv.login('YOUR_PIXIV_ACCOUNT', 'YOUR_PIXIV_PASSWORD')
  console.log(await p.postIllustLike(70337017))
  console.log(await p.getUserProfileData(5323203))
})()
```
