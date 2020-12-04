import Koa from "koa"
import Router from "@koa/router"
import { PassThrough } from "stream"
import { Channel } from "./channel"
import { getchannels } from "./nicojk"
import { createReadStream } from "fs"

const port = process.env.PORT || "5000"

const main = async () => {
  const app = new Koa()
  const router = new Router()

  const availableChannels = await getchannels()

  const channels = [
    ...availableChannels.channels.channel,
    ...availableChannels.channels.bs_channel,
    ...availableChannels.channels.radio_channel,
  ].map((channel) => {
    return new Channel(channel.video[0])
  })

  router.get("/", (ctx) => {
    ctx.body = createReadStream(`${__dirname}/index.html`)
    ctx.type = "html"
  })

  router.get("/:channelId", (ctx) => {
    const channelId = ctx.params.channelId
    const channel = channels.find((c) => c.v === channelId)
    if (!channel) return ctx.throw(404)
    ctx.body = createReadStream(`${__dirname}/player.html`)
    ctx.type = "html"
  })

  const sseRouter = new Router()
  sseRouter.get("/:channelId", async (ctx) => {
    const channelId = ctx.params.channelId
    const channel = channels.find((c) => c.v === channelId)

    if (!channel) return ctx.throw(404)

    ctx.request.socket.setTimeout(0)
    ctx.req.socket.setNoDelay(true)
    ctx.req.socket.setKeepAlive(true)

    ctx.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    })

    const stream = new PassThrough()

    ctx.status = 200
    ctx.body = stream

    const listener = ({ event, data }: { event: string; data: any }) => {
      stream.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    listener({ event: "hello", data: {} })

    channel.event.addListener("data", listener)

    stream.on("close", () => {
      channel.event.removeListener("data", listener)
      if (channel.event.listenerCount("data") === 0) {
        channel.close()
      }
    })

    channel.connect()
  })

  router.use("/sse", sseRouter.routes())
  app.use(router.routes())
  const server = app.listen(port, () => {
    console.log(`listen on http://localhost:${port}`)
  })

  process.on("SIGINT", () => {
    server.close()
    for (let channel of channels) {
      channel.close()
    }
    console.log("closed.")
    process.exit()
  })
}
main()
