from typing import Dict

from websockets import WebSocketServerProtocol

from const.module_const import EModule
from helper.log_helper import Log
from module.base.base_module import BaseModule
from module.login.login_define import UserInfo, LoginInfo
from module.base.module_register import ModuleRegister


class LoginModule(BaseModule):

    def __init__(self):
        super().__init__()
        self.dict_on_line_player: Dict[int, LoginInfo] = {}

        # 注册网络事件
        ModuleRegister.get(EModule.WebSocket).register_msg(1, self.on_player_login)

    def __del__(self):
        super().__del__()
        pass

    def on_player_login(self, player_id: int, web_socket: WebSocketServerProtocol) -> None:

        Log.info("玩家登录 ", player_id)

        user_info = UserInfo(player_id)
        login_info = LoginInfo(user_info, web_socket)
        self.dict_on_line_player[player_id] = login_info

    def on_player_logout(self, player_id: int) -> None:

        Log.info("玩家登出 ", player_id)

        if player_id in self.dict_on_line_player:
            del self.dict_on_line_player[player_id]

    def get_player_web_socket(self, player_id: int) -> WebSocketServerProtocol | None:
        if player_id in self.dict_on_line_player:
            return self.dict_on_line_player[player_id].web_socket
        else:
            Log.info("玩家不在线")
            return None

    def is_player_online(self, player_id) -> bool:
        return player_id in self.dict_on_line_player

    @staticmethod
    def register():
        ModuleRegister.register(EModule.Login, LoginModule())
