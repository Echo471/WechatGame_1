from lib.event import Event


class ServerEvent():
    OnMessage: Event = Event()  # 服务器接收到消息
