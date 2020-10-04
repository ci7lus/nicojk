import axios from "axios"
import xml2js from "xml2js"
import { dayjs } from "./common"
import querystring from "querystring"
import { GetChannels, Getflv } from "./types"

export const getflv = async (v: string) => {
  const getflvReq = await axios.get<string>(
    "http://jk.nicovideo.jp/api/getflv",
    {
      params: { v: v },
      responseType: "text",
    }
  )
  const getflv = querystring.parse(getflvReq.data) as Getflv
  if ("error" in getflv) throw new Error(getflv.error)
  const channel_no = parseInt(getflv.channel_no)
  const channel_name = getflv.channel_name
  const threadId = parseInt(getflv.thread_id)
  const ms = getflv.ms
  const httpPort = parseInt(getflv.http_port)
  const streamPort = parseInt(getflv.ms_port)
  const start_time = dayjs.unix(parseInt(getflv.start_time))
  const end_time = dayjs.unix(parseInt(getflv.end_time))

  return {
    channel_no,
    channel_name,
    threadId,
    ms,
    httpPort,
    streamPort,
    start_time,
    end_time,
  }
}

export const getchannels = async () => {
  const getchannelsReq = await axios.get<string>(
    "http://jk.nicovideo.jp/api/v2/getchannels/",
    {
      responseType: "text",
    }
  )
  const getchannels: GetChannels = await xml2js.parseStringPromise(
    getchannelsReq.data.trim()
  )
  return getchannels
}
