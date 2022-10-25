# URLPattern Router

A simple, minimal, proxy URLPattern api router for web api based server with no
dependencies

May be work in `deno` `bun` `workers` I personaly create this module in `deno`

Create proxy router using url pattern api
https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API

```typescript
import { createProxyRouter } from "./mod.ts";
const router = createProxyRouter()
  /** Wisth string */
  /** Simple home */
  .get("/", () => {
    console.log("Called.")
    return null
  }, () => {
    return new Response("Hello world");
  })
  /** With params */
  .get("/hey/:name", ({ pattern }) => {
    return new Response("Hey " + pattern.pathname.groups.name || "Bro");
  })
  /** With URLPattern contructor */
  .get(new URLPattern("http(s)://localhost/hoy/:name"), ({ pattern }) => {
    return new Response("Hoy " + pattern.pathname.groups.name || "Bro");
  })
  /** Using URLPatternInit Object */
  .get(
    { pathname: "/hello/:name", hostname: "localhost" },
    (ctx) => {
      console.log(ctx?.pattern.pathname);
      return new Response(
        `Hello ${ctx?.pattern.pathname.groups.name || "Guest"}`,
      );
    },
  );

/** Handle Request Object. The routes resolve ordered from start to end */
const res = router.handler(new Request("http://localhost")); // GET / -> Hello
```

### Learn more about URLPattern api

https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
