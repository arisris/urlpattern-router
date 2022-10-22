import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";
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

Deno.test("GET /", async () => {
  const res = await router.handler(new Request("http://localhost"))
  assertEquals(res.status, 200)
  assertEquals(await res.text(), "Hello")
})

Deno.test("GET /hello/:name", async () => {
  const res = await router.handler(new Request("http://localhost/hello/world"))
  assertEquals(res.ok, true)
  assertEquals(await res.text(), "Hello world")
})