export type Getflv =
  | {
      thread_id: string
      ms: string
      ms_port: string
      http_port: string
      channel_no: string
      channel_name: string
      genre_id: string
      base_time: string
      open_time: string
      start_time: string
      end_time: string
    }
  | {
      code: 1
      error: string
    }

export type Packet = {
  packet: {
    thread: [Thread]
    viewer_counter: [ViewCounter]
  }
}

export type Thread = {
  $: {
    resultcode: 0
    thread: string
    last_res: string
    ticket: string
    revision: string
    server_time: string
  }
}

export type ViewCounter = {
  $: {
    video: string
    id: string
  }
}

export type SocketData =
  | Chat
  | { view_counter: ViewCounter }
  | { thread: Thread }

export type Chat = {
  chat: {
    _: string
    $: {
      thread: string
      no: string
      vpos: string
      date: string
      date_usec: string
      mail: string
      user_id: string
      anonymity: string
      premium: string
    }
  }
}

type Channel = {
  id: [string]
  radiko_id?: [string]
  no: [string]
  name: [string]
  video: [string]
  thread: [{ id: [string]; last_res: [string]; force: [string] }]
}

export type GetChannels = {
  channels: {
    $: {
      status: "ok"
    }
    channel: Channel[]
    bs_channel: Channel[]
    radio_channel: Channel[]
  }
}
