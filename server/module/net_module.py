# -*- coding: utf-8 -*-
import asyncio
from typing import Dict

from const.module_const import EModule
from helper.log_helper import Log
from module.base.base_module import BaseModule
import websockets

from module.base.module_register import ModuleRegister


class NetModule(BaseModule):
    def __init__(self):
        super().__init__()

        Log.info("websocket server start")

        self.msg_registry: Dict[int, callable] = {}

# [start]: websocket
    def start(self):
        self.server = websockets.serve(self.on_connection, "127.0.0.1", 8888)
        asyncio.get_event_loop().run_until_complete(self.server)
        asyncio.get_event_loop().run_forever()

    async def on_message(self, websocket):
        while True:
            recv_text = await websocket.recv()
            Log.info("接收到消息：", recv_text)
            # TODO: 消息处理

    # 握手并且接收数据
    async def on_connection(self, websocket, path):
        Log.info("新的websocket连接：", path)
        await self.on_message(websocket)
# [end]: websocket

# [start]: register
    def register_msg(self, msg_id: int, callback: callable):
        if msg_id in self.msg_registry:
            Log.error("消息id已经注册", msg_id)
            return
        self.msg_registry[msg_id] = callback

    def unregister_msg(self, msg_id: int):
        if msg_id in self.msg_registry:
            del self.msg_registry[msg_id]
        else:
            Log.error("消息id未注册", msg_id)
# [end]: register


    @staticmethod
    def register():
        ins = NetModule()
        asyncio.run(ins.start())
        ModuleRegister.register(EModule.WebSocket, ins)
