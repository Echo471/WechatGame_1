# # -*- coding: utf-8 -*-
from enum import Enum

from websockets import WebSocketServerProtocol


class UserInfo():

    def __init__(self, id: int):
        self.id = id


class LoginInfo():

    def __init__(self, user_info: UserInfo, web_socket: WebSocketServerProtocol) -> None:
        super().__init__()
        self.user_info = user_info
        self.web_socket = web_socket

    def __del__(self):
        self.user_info = None
        self.web_socket = None
