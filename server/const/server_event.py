from lib.event import Event


class ServerEvent():
    SERVER_TICK = Event()

    ON_WEBSOCKET_DISCONNECT = Event()   # 连接关闭
