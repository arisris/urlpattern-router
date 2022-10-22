type RouterProxyMethod = "get" | "post" | "put" | "patch" | "delete" | "all"
type ResponseOrPromiseResponse = Response | Promise<Response>
type RouterProxyContext = { req: Request, pattern: URLPatternResult }
type RouterProxyHandler = (ctx?: RouterProxyContext) => ResponseOrPromiseResponse | null | Promise<null>
type RouterProxyRoutes = [string, URLPattern, RouterProxyHandler[]][]
type RouterProxyObject = { readonly handler: (req: Request) => ResponseOrPromiseResponse, readonly routes: RouterProxyRoutes, variables: Record<string, never> } &
  { [k in RouterProxyMethod]: (urlPattern: URLPattern, ...handlers: RouterProxyHandler[]) => RouterProxyObject }

/**
 * Create proxy router using url pattern api https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 * @example
 * 
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
 *
 *
 * Learn more about URLPattern api
 * @link https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 * @param routes Optional Initial routes
 * @example [ ["GET", new URLPatterm("http://localhost:3000/hello"), () => new Response("Hello World")] ]
 * @param variables Optional initial variables
 * @example {hello: "world"}
 * @returns {RouterProxyObject} A proxy of RouterProxyObject
 */

export function createProxyRouter<TVar extends { [k: string]: unknown }>(routes: RouterProxyRoutes = [], variables?: TVar): RouterProxyObject {
  return new Proxy<RouterProxyObject>(Object.seal({
    routes,
    variables,
    handler: async (req: Request): Promise<Response> => {
      let res: Response | null, urlPatternResult: URLPatternResult | null = null
      const url = new URL(req.url)
      for (const [method, urlPattern, handlers] of routes) {
        if (
          (method === req.method || method === "ALL") &&
          (urlPatternResult = urlPattern.exec(url.pathname, url.origin)) !== null
        ) {
          for (const handler of handlers) {
            if ((res = await handler({ req, pattern: urlPatternResult })) !== null) return res
          }
        }
      }
      return new Response("404 Not Found", { status: 404 })
    }
  } as never), {
    get: (target, p, receiver) => p in target
      ? target[p as never]
      : (urlPattern: URLPattern, ...handlers: RouterProxyHandler[]) => routes.push([p.toString().toLocaleUpperCase(), urlPattern, handlers]) && receiver
  }) as RouterProxyObject
}

