# URLPattern Router
A simple, minimal URLPattern api router for web api based server with no dependencies

May be work in `deno` `bun` `workers`
I personaly create this module in `deno`

Create proxy router using url pattern api https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API

```ts
  import { createProxyRouter } from "./mod.ts";
  const router = createProxyRouter()
    .get(new URLPattern("http(s?)://localhost/"), () => {
      return new Response("Hello")
    })
    .get(
      new URLPattern("http(s?)://localhost/hello/:name"),
      (ctx) => {
        console.log(ctx?.pattern.pathname)
        return new Response(`Hello ${ctx?.pattern.pathname.groups.name || "Guest"}`)
    })
  const res = router.handler(new Request("http://localhost")) // GET / -> Hello
```
### Learn more about URLPattern api
https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
