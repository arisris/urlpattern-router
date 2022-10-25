export enum HTTP_METHODS { GET = "get", POST = "post", PUT = "put", PATCH = "patch", DELETE = "delete", HEAD = "head", OPTIONS = "options", ALL = "all" }
type ResponseOrPromiseResponse = Response | Promise<Response>
type RouterProxyContext = { req: Request, pattern: URLPatternResult }
type RouterProxyHandler = (ctx: RouterProxyContext) => ResponseOrPromiseResponse | null | Promise<null>
type RouterProxyRoutes = [keyof (typeof HTTP_METHODS), URLPattern, RouterProxyHandler[]][]
type RouterProxyObject = { readonly handler: (req: Request) => ResponseOrPromiseResponse, readonly routes: RouterProxyRoutes, variables: Record<string, never> } &
  { [k in HTTP_METHODS]: (urlPattern: URLPatternInput, ...handlers: RouterProxyHandler[]) => RouterProxyObject }

/**
 * Create proxy router using url pattern api https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 * @example
 * 
  const router = createProxyRouter()
  .get("/", () => {
    return new Response("Hello world")
  })
  .get("/hey/:name", ({ pattern }) => {
    return new Response("Hey " + pattern.pathname.groups.name || "Bro")
  })
  .get(
    { pathname: "/hello/:name", hostname: "localhost" },
    (ctx) => {
      console.log(ctx?.pattern.pathname)
      return new Response(`Hello ${ctx?.pattern.pathname.groups.name || "Guest"}`)
    })
  const res = router.handler(new Request("http://localhost")) // GET / -> Hello world
 *
 *
 * Learn more about URLPattern api
 * @link https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 * @param routes Optional Initial routes
 * @example [ ["GET", "/", (_ctx) => new Response("Hello World")] ]
 * @param variables Optional initial variables
 * @example {hello: "world"}
 * @param baseUrl A Base url
 * @returns {RouterProxyObject} A proxy of RouterProxyObject
 */

export function createProxyRouter<TVar extends { [k: string]: unknown }>(
  routes: RouterProxyRoutes = [],
  /** Todo : Its not working at this time */
  variables?: TVar,
  /** Optional its just for shim if you provide pathname string without base url */
  baseUrl = "http://localhost"
): RouterProxyObject {
  return new Proxy<RouterProxyObject>(Object.seal({
    routes,
    variables,
    handler: async (req: Request): Promise<Response> => {
      let res: Response | null, urlPatternResult: URLPatternResult | null = null
      const url = new URL(req.url)
      for (const [method, urlPattern, handlers] of routes) {
        if (
          (method === req.method || method === "ALL") &&
          (urlPatternResult = urlPattern.exec(url, urlPattern?.hostname === baseUrl ? url.hostname : undefined)) !== null
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
      : (urlPattern: URLPatternInput, ...handlers: RouterProxyHandler[]) =>
        routes.push(
          [
            String(p).toUpperCase() as keyof (typeof HTTP_METHODS),
            new URLPattern(
              urlPattern,
              urlPattern.toString().startsWith("/")
                ? baseUrl
                : undefined
            ),
            handlers
          ]
        ) && receiver
  }) as RouterProxyObject
}

