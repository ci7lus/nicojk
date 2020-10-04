import xml2js from "xml2js"
import net from "net"
import { EventEmitter } from "events"
import { SocketData } from "./types"
import { getflv } from "./nicojk"

export class Channel {
  public event = new EventEmitter()
  private socket: net.Socket | null = null
  private connecting = false
  constructor(public v: string) {}

  async connect() {
    if (this.connecting || this.socket) return false
    try {
      this.connecting = true
      console.log(`[${this.v}] Getting ready to connect to ${this.v}.`)
      const { threadId, ms, httpPort, streamPort } = await getflv(this.v)

      console.log(
        `[${this.v}] A latest thread is ${threadId}(${ms}:${httpPort}/${streamPort})`
      )

      const socket = new net.Socket()

      socket.on("data", async (data) => {
        const s = data.toString("utf8")
        const parsed: SocketData = await xml2js.parseStringPromise(s.trim())
        if ("chat" in parsed) {
          this.event.emit("data", {
            event: "chat",
            data: {
              thread: parsed.chat.$.thread,
              no: parseInt(parsed.chat.$.no),
              vpos: parseInt(parsed.chat.$.vpos),
              date: parseInt(parsed.chat.$.date),
              date_usec: parseInt(parsed.chat.$.date_usec),
              mail: parsed.chat.$.mail,
              user_id: parsed.chat.$.user_id,
              anonymity: parsed.chat.$.anonymity === "1",
              premium: parsed.chat.$.premium === "1",
              content: parsed.chat._,
            },
          })
        } else if ("view_counter" in parsed || "thread" in parsed) {
          this.event.emit("data", { event: "heartbeat", data: {} })
        } else {
          console.log(parsed)
        }
      })

      socket.on("close", () => {
        console.log(`[${this.v}] Disconnected.`)
        this.socket = null
      })

      socket.on("connect", () => {
        console.log(`[${this.v}] Socket connected!`)
      })

      socket.connect(streamPort, ms, () => {
        const hello = `<thread res_from="-10" version="20061206" thread="${threadId}" />\0`
        console.log(
          `[${this.v}] Trying to connect to ${ms}:${streamPort} with '${hello}'`
        )
        socket.write(hello)
      })

      this.socket = socket
    } catch (error) {
      throw error
    } finally {
      this.connecting = false
    }
  }

  close() {
    if (this.socket) {
      this.socket.destroy()
    }
  }
}
